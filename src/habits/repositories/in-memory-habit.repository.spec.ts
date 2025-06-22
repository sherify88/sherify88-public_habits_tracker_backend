import { InMemoryHabitRepository } from './in-memory-habit.repository';
import { Habit } from '../entities/habit.entity';
import { ConflictException } from '@nestjs/common';

describe('InMemoryHabitRepository', () => {
    let repository: InMemoryHabitRepository;

    beforeEach(() => {
        repository = new InMemoryHabitRepository();
        // Clean up any habits before each test
        (repository as any).habits = [];
        (repository as any).nextId = 1;
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('Streak and Completion Calculation (on read)', () => {
        it('should reset streak to 0 if a day was missed', async () => {
            const habit = await repository.create({ name: 'Read' });
            const internalHabits = (repository as any).habits;

            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            // Manually set stale data
            internalHabits[0].lastCompletedAt = twoDaysAgo;
            internalHabits[0].currentStreak = 5;

            const fetchedHabit = await repository.getById(habit.id);
            expect(fetchedHabit.currentStreak).toBe(0);
            expect(fetchedHabit.isCompletedToday).toBe(false);
        });

        it('should maintain streak if completed yesterday', async () => {
            const habit = await repository.create({ name: 'Run' });
            const internalHabits = (repository as any).habits;

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            internalHabits[0].lastCompletedAt = yesterday;
            internalHabits[0].currentStreak = 3;

            const fetchedHabit = await repository.getById(habit.id);
            expect(fetchedHabit.currentStreak).toBe(3);
            expect(fetchedHabit.isCompletedToday).toBe(false);
        });
    });

    describe('toggleCompleteForToday (on write)', () => {
        it('should start a streak of 1 on first completion', async () => {
            const habit = await repository.create({ name: 'Meditate' });
            const toggledHabit = await repository.toggleCompleteForToday(habit.id, true);

            expect(toggledHabit.currentStreak).toBe(1);
            expect(toggledHabit.longestStreak).toBe(1);
            expect(toggledHabit.totalCompletions).toBe(1);
            expect(toggledHabit.isCompletedToday).toBe(true);
        });

        it('should increment streak on consecutive days', async () => {
            const habit = await repository.create({ name: 'Journal' });
            const internalHabits = (repository as any).habits;

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            // Simulate a completion from yesterday
            internalHabits[0].lastCompletedAt = yesterday;
            internalHabits[0].currentStreak = 1;
            internalHabits[0].longestStreak = 1;

            // Now, complete it for today
            const toggledHabit = await repository.toggleCompleteForToday(habit.id, true);

            expect(toggledHabit.currentStreak).toBe(2);
            expect(toggledHabit.isCompletedToday).toBe(true);
        });

        it('should reset streak to 1 if a day was skipped', async () => {
            const habit = await repository.create({ name: 'Workout' });
            const internalHabits = (repository as any).habits;

            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            // Simulate a completion from two days ago
            internalHabits[0].lastCompletedAt = twoDaysAgo;
            internalHabits[0].currentStreak = 4;

            // Now, complete it for today
            const toggledHabit = await repository.toggleCompleteForToday(habit.id, true);

            expect(toggledHabit.currentStreak).toBe(1);
        });
    });

    describe('CRUD operations', () => {
        it('should create and retrieve a habit', async () => {
            const habitData = { name: 'Learn NestJS', description: 'Study docs' };
            const created = await repository.create(habitData);
            const found = await repository.getById(created.id);

            expect(found).toBeDefined();
            expect(found.name).toBe('Learn NestJS');
            expect(found.id).toBe(1);
        });

        it('should not allow duplicate names on create', async () => {
            await repository.create({ name: 'Duplicate Habit' });
            await expect(repository.create({ name: 'Duplicate Habit' })).rejects.toThrow(ConflictException);
        });

        it('should update a habit', async () => {
            const habit = await repository.create({ name: 'Original' });
            await repository.update(habit.id, { name: 'Updated' });
            const found = await repository.getById(habit.id);
            expect(found.name).toBe('Updated');
        });

        it('should delete a habit', async () => {
            const habit = await repository.create({ name: 'To Delete' });
            await repository.delete(habit.id);
            const found = await repository.getById(habit.id);
            expect(found).toBeNull();
        });
    });
}); 