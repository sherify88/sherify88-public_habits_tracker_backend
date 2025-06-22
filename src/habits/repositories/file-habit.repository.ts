import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Habit } from '../entities/habit.entity';
import { IHabitRepository } from '../interfaces/habit-repository.interface';

@Injectable()
export class FileHabitRepository implements IHabitRepository {
    private readonly logger = new Logger(FileHabitRepository.name);
    private readonly filePath = join(process.cwd(), 'habits.json');

    private async ensureFileExists(): Promise<void> {
        try {
            await fs.access(this.filePath);
        } catch {
            await fs.writeFile(this.filePath, JSON.stringify([]));
        }
    }

    private async readHabits(): Promise<Habit[]> {
        await this.ensureFileExists();
        try {
            const data = await fs.readFile(this.filePath, 'utf-8');
            // Handle empty file or whitespace-only content
            if (!data || data.trim() === '') {
                return [];
            }
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.warn('Error reading habits.json, starting with empty array:', error.message);
            // If file is corrupted, reset it
            await fs.writeFile(this.filePath, JSON.stringify([]));
            return [];
        }
    }

    private async writeHabits(habits: Habit[]): Promise<void> {
        await fs.writeFile(this.filePath, JSON.stringify(habits, null, 2));
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
        this.logger.log('Fetching all habits from file storage.');
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
        const habits = await this.getAll();
        return habits;
    }
} 