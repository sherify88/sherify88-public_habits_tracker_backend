import { Habit } from '../entities/habit.entity';

export interface IHabitRepository {
    getAll(): Promise<Habit[]>;
    getById(id: number): Promise<Habit | null>;
    create(habit: Partial<Habit>): Promise<Habit>;
    update(id: number, habit: Partial<Habit>): Promise<Habit | null>;
    delete(id: number): Promise<boolean>;
    toggleCompleteForToday(id: number, completed: boolean): Promise<Habit | null>;
    getHabitsWithStreaks(): Promise<Habit[]>;
} 