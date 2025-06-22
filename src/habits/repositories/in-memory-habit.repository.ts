import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Habit } from '../entities/habit.entity';
import { IHabitRepository } from '../interfaces/habit-repository.interface';

@Injectable()
export class InMemoryHabitRepository implements IHabitRepository {
    private readonly logger = new Logger(InMemoryHabitRepository.name);
    private readonly habits: Habit[] = [];
    private nextId = 1;

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
        return this.habits.map(h => this.recalculateStreakAndCompletion(h));
    }

    async getById(id: number): Promise<Habit | null> {
        const habit = this.habits.find((h) => h.id === id);
        if (!habit) {
            return null;
        }
        return this.recalculateStreakAndCompletion(habit);
    }

    async create(habitData: Partial<Habit>): Promise<Habit> {
        const existingHabit = this.habits.find(
            (h) => h.name.toLowerCase() === habitData.name!.toLowerCase(),
        );
        if (existingHabit) {
            throw new ConflictException(`A habit with the name "${habitData.name}" already exists.`);
        }

        const habit: Habit = {
            id: this.nextId++,
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

        this.habits.push(habit);
        return habit;
    }

    async update(id: number, habitData: Partial<Habit>): Promise<Habit | null> {
        const index = this.habits.findIndex(habit => habit.id === id);
        if (index === -1) return null;

        if (habitData.name) {
            const existingHabit = this.habits.find(
                (h) => h.name.toLowerCase() === habitData.name!.toLowerCase() && h.id !== id,
            );
            if (existingHabit) {
                throw new ConflictException(`A habit with the name "${habitData.name}" already exists.`);
            }
        }

        this.habits[index] = {
            ...this.habits[index],
            ...habitData,
            updatedDate: new Date(),
        };

        return this.habits[index];
    }

    async delete(id: number): Promise<boolean> {
        const index = this.habits.findIndex(habit => habit.id === id);
        if (index === -1) return false;

        this.habits.splice(index, 1);
        return true;
    }

    async toggleCompleteForToday(id: number, completed: boolean): Promise<Habit | null> {
        const habit = this.habits.find((h) => h.id === id);
        if (!habit) return null;

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

        return this.recalculateStreakAndCompletion(habit);
    }

    async getHabitsWithStreaks(): Promise<Habit[]> {
        const habits = await this.getAll();
        return habits;
    }
} 