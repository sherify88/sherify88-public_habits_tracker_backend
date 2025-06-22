import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Habit } from '../entities/habit.entity';
import { IHabitRepository } from '../interfaces/habit-repository.interface';

@Injectable()
export class S3HabitRepository implements IHabitRepository {
    private readonly logger = new Logger(S3HabitRepository.name);
    private readonly s3Client: S3Client;
    private readonly bucketName: string;
    private readonly key = 'habits.json';

    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION || 'eu-central-1',
        });

        // Get bucket name from environment or use a default pattern
        this.bucketName = process.env.HABITS_S3_BUCKET ||
            `habits-tracker-storage-${process.env.NODE_ENV || 'dev'}-${process.env.AWS_ACCOUNT_ID || 'default'}`;
    }

    private async ensureBucketExists(): Promise<void> {
        // In a real implementation, you might want to create the bucket if it doesn't exist
        // For now, we'll assume the bucket exists (created by SAM template)
        return Promise.resolve();
    }

    private async readHabits(): Promise<Habit[]> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: this.key,
            });

            const response = await this.s3Client.send(command);

            if (!response.Body) {
                return [];
            }

            const data = await response.Body.transformToString();

            // Handle empty file or whitespace-only content
            if (!data || data.trim() === '') {
                return [];
            }

            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error: any) {
            // If file doesn't exist (NoSuchKey), return empty array
            if (error.name === 'NoSuchKey') {
                return [];
            }

            console.warn('Error reading habits from S3, starting with empty array:', error.message);
            return [];
        }
    }

    private async writeHabits(habits: Habit[]): Promise<void> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: this.key,
            Body: JSON.stringify(habits, null, 2),
            ContentType: 'application/json',
        });

        await this.s3Client.send(command);
    }

    private recalculateStreakAndCompletion(habit: Habit): Habit {
        if (!habit.lastCompletedAt) {
            return { ...habit, currentStreak: 0, isCompletedToday: false };
        }

        const today_utc = new Date();
        const lastCompleted_utc = new Date(habit.lastCompletedAt);

        const isCompletedToday =
            today_utc.getUTCFullYear() === lastCompleted_utc.getUTCFullYear() &&
            today_utc.getUTCMonth() === lastCompleted_utc.getUTCMonth() &&
            today_utc.getUTCDate() === lastCompleted_utc.getUTCDate();

        const yesterday_utc = new Date();
        yesterday_utc.setUTCDate(yesterday_utc.getUTCDate() - 1);

        const wasCompletedYesterday =
            yesterday_utc.getUTCFullYear() === lastCompleted_utc.getUTCFullYear() &&
            yesterday_utc.getUTCMonth() === lastCompleted_utc.getUTCMonth() &&
            yesterday_utc.getUTCDate() === lastCompleted_utc.getUTCDate();

        const updatedHabit = { ...habit };
        updatedHabit.isCompletedToday = isCompletedToday;

        if (!isCompletedToday && !wasCompletedYesterday) {
            updatedHabit.currentStreak = 0;
        }

        return updatedHabit;
    }

    async getAll(): Promise<Habit[]> {
        this.logger.log(`Fetching all habits from S3 bucket: ${this.bucketName}`);
        await this.ensureBucketExists();
        const habits = await this.readHabits();
        return habits.map(h => this.recalculateStreakAndCompletion(h));
    }

    async getById(id: number): Promise<Habit | null> {
        const habits = await this.readHabits();
        const habit = habits.find(h => h.id === id);
        if (!habit) return null;
        return this.recalculateStreakAndCompletion(habit);
    }

    async create(habitData: Partial<Habit>): Promise<Habit> {
        const habits = await this.readHabits();

        const existingHabit = habits.find(
            (h) => h.name.toLowerCase() === habitData.name!.toLowerCase(),
        );
        if (existingHabit) {
            throw new ConflictException(`A habit with the name "${habitData.name}" already exists.`);
        }

        const nextId = habits.length > 0 ? Math.max(...habits.map(h => h.id)) + 1 : 1;

        const habit: Habit = {
            id: nextId,
            name: habitData.name!,
            description: habitData.description || '',
            currentStreak: 0,
            longestStreak: 0,
            lastCompletedAt: null,
            isCompletedToday: false,
            totalCompletions: 0,
            createdDate: new Date(),
            updatedDate: new Date(),
            deletedDate: null,
            createdById: null,
            updatedById: null,
        } as Habit;

        habits.push(habit);
        await this.writeHabits(habits);

        return habit;
    }

    async update(id: number, habitData: Partial<Habit>): Promise<Habit | null> {
        const habits = await this.readHabits();
        const index = habits.findIndex(h => h.id === id);

        if (index === -1) return null;

        if (habitData.name) {
            const existingHabit = habits.find(
                (h) => h.name.toLowerCase() === habitData.name!.toLowerCase() && h.id !== id,
            );
            if (existingHabit) {
                throw new ConflictException(`A habit with the name "${habitData.name}" already exists.`);
            }
        }

        habits[index] = {
            ...habits[index],
            ...habitData,
            updatedDate: new Date(),
        };

        await this.writeHabits(habits);

        return habits[index];
    }

    async delete(id: number): Promise<boolean> {
        const habits = await this.readHabits();
        const index = habits.findIndex(h => h.id === id);

        if (index === -1) return false;

        habits.splice(index, 1);
        await this.writeHabits(habits);
        return true;
    }

    async toggleCompleteForToday(id: number, completed: boolean): Promise<Habit | null> {
        const habits = await this.readHabits();
        const index = habits.findIndex(h => h.id === id);
        if (index === -1) return null;

        const habit = habits[index];

        const today_utc = new Date();
        const lastCompleted_utc = habit.lastCompletedAt ? new Date(habit.lastCompletedAt) : null;

        const isCompletedToday = lastCompleted_utc &&
            today_utc.getUTCFullYear() === lastCompleted_utc.getUTCFullYear() &&
            today_utc.getUTCMonth() === lastCompleted_utc.getUTCMonth() &&
            today_utc.getUTCDate() === lastCompleted_utc.getUTCDate();

        if (completed && !isCompletedToday) {
            const yesterday_utc = new Date();
            yesterday_utc.setUTCDate(yesterday_utc.getUTCDate() - 1);

            const wasCompletedYesterday = lastCompleted_utc &&
                yesterday_utc.getUTCFullYear() === lastCompleted_utc.getUTCFullYear() &&
                yesterday_utc.getUTCMonth() === lastCompleted_utc.getUTCMonth() &&
                yesterday_utc.getUTCDate() === lastCompleted_utc.getUTCDate();

            if (wasCompletedYesterday) { 
                habit.currentStreak += 1;
            } else {
                habit.currentStreak = 1;
            } 

            if (habit.currentStreak > habit.longestStreak) {
                habit.longestStreak = habit.currentStreak;
            }
            habit.totalCompletions += 1;
            habit.lastCompletedAt = new Date();

        } else if (!completed && isCompletedToday) {
            habit.totalCompletions = Math.max(0, habit.totalCompletions - 1);
            habit.currentStreak = Math.max(0, habit.currentStreak - 1);
            habit.lastCompletedAt = null;
        }

        habit.updatedDate = new Date();
        await this.writeHabits(habits);

        return this.recalculateStreakAndCompletion(habit);
    }

    async getHabitsWithStreaks(): Promise<Habit[]> {
        return this.getAll();
    }
} 