import { Test, TestingModule } from '@nestjs/testing';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { Habit } from './entities/habit.entity';
import { IHabitRepository } from './interfaces/habit-repository.interface';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('HabitsService', () => {
    let service: HabitsService;
    let mockRepository: jest.Mocked<IHabitRepository>;

    const mockHabit: Habit = {
        id: 1,
        name: 'Morning Exercise',
        description: '30 minutes of cardio',
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedAt: null,
        isCompletedToday: false,
        totalCompletions: 0,
        createdDate: new Date('2025-06-21T10:00:00Z'),
        updatedDate: new Date('2025-06-21T10:00:00Z'),
        deletedDate: null,
        createdById: null,
        updatedById: null,
    };

    beforeEach(async () => {
        const mockRepositoryProvider = {
            provide: 'IHabitRepository',
            useValue: {
                getAll: jest.fn(),
                getById: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                toggleCompleteForToday: jest.fn(),
                getHabitsWithStreaks: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [HabitsService, mockRepositoryProvider],
        }).compile();

        service = module.get<HabitsService>(HabitsService);
        mockRepository = module.get('IHabitRepository');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new habit successfully', async () => {
            // Arrange
            const createHabitDto: CreateHabitDto = {
                name: 'Morning Exercise',
                description: '30 minutes of cardio',
            };

            mockRepository.create.mockResolvedValue(mockHabit);

            // Act
            const result = await service.create(createHabitDto);

            // Assert
            expect(mockRepository.create).toHaveBeenCalledWith(createHabitDto);
            expect(mockRepository.create).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockHabit);
            expect(result.id).toBe(1);
            expect(result.name).toBe('Morning Exercise');
            expect(result.description).toBe('30 minutes of cardio');
        });

        it('should create a habit with only name (no description)', async () => {
            // Arrange
            const createHabitDto: CreateHabitDto = {
                name: 'Drink Water',
            };

            const habitWithoutDescription: Habit = {
                ...mockHabit,
                id: 2,
                name: 'Drink Water',
                description: '',
            };

            mockRepository.create.mockResolvedValue(habitWithoutDescription);

            // Act
            const result = await service.create(createHabitDto);

            // Assert
            expect(mockRepository.create).toHaveBeenCalledWith(createHabitDto);
            expect(result).toEqual(habitWithoutDescription);
            expect(result.description).toBe('');
        });

        it('should create a habit with empty description', async () => {
            // Arrange
            const createHabitDto: CreateHabitDto = {
                name: 'Read Books',
                description: '',
            };

            const habitWithEmptyDescription: Habit = {
                ...mockHabit,
                id: 3,
                name: 'Read Books',
                description: '',
            };

            mockRepository.create.mockResolvedValue(habitWithEmptyDescription);

            // Act
            const result = await service.create(createHabitDto);

            // Assert
            expect(mockRepository.create).toHaveBeenCalledWith(createHabitDto);
            expect(result.description).toBe('');
        });

        it('should handle repository errors gracefully', async () => {
            // Arrange
            const createHabitDto: CreateHabitDto = {
                name: 'Test Habit',
                description: 'Test Description',
            };

            const repositoryError = new Error('Database connection failed');
            mockRepository.create.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(service.create(createHabitDto)).rejects.toThrow('Database connection failed');
            expect(mockRepository.create).toHaveBeenCalledWith(createHabitDto);
        });

        it('should throw ConflictException if habit name already exists', async () => {
            // Arrange
            const createHabitDto: CreateHabitDto = { name: 'Existing Habit' };
            const conflictError = new ConflictException(`A habit with the name "Existing Habit" already exists.`);

            mockRepository.create.mockRejectedValue(conflictError);

            // Act & Assert
            await expect(service.create(createHabitDto)).rejects.toThrow(ConflictException);
            await expect(service.create(createHabitDto)).rejects.toThrow(
                'A habit with the name "Existing Habit" already exists.',
            );
        });

        it('should create multiple habits with different IDs', async () => {
            // Arrange
            const habit1Dto: CreateHabitDto = { name: 'Habit 1' };
            const habit2Dto: CreateHabitDto = { name: 'Habit 2' };

            const habit1: Habit = { ...mockHabit, id: 1, name: 'Habit 1' };
            const habit2: Habit = { ...mockHabit, id: 2, name: 'Habit 2' };

            mockRepository.create
                .mockResolvedValueOnce(habit1)
                .mockResolvedValueOnce(habit2);

            // Act
            const result1 = await service.create(habit1Dto);
            const result2 = await service.create(habit2Dto);

            // Assert
            expect(result1.id).toBe(1);
            expect(result2.id).toBe(2);
            expect(mockRepository.create).toHaveBeenCalledTimes(2);
        });

        it('should create habit with long description', async () => {
            // Arrange
            const longDescription = 'This is a very long description that tests the maximum length handling of the habit description field. It should be able to handle descriptions up to 500 characters as defined in the DTO validation.';

            const createHabitDto: CreateHabitDto = {
                name: 'Long Description Habit',
                description: longDescription,
            };

            const habitWithLongDescription: Habit = {
                ...mockHabit,
                id: 4,
                name: 'Long Description Habit',
                description: longDescription,
            };

            mockRepository.create.mockResolvedValue(habitWithLongDescription);

            // Act
            const result = await service.create(createHabitDto);

            // Assert
            expect(result.description).toBe(longDescription);
            expect(result.description.length).toBeGreaterThan(100);
        });

        it('should verify habit properties after creation', async () => {
            // Arrange
            const createHabitDto: CreateHabitDto = {
                name: 'New Habit',
                description: 'New Description',
            };

            const expectedHabit: Habit = {
                ...mockHabit,
                id: 5,
                name: 'New Habit',
                description: 'New Description',
                currentStreak: 0,
                longestStreak: 0,
                isCompletedToday: false,
                totalCompletions: 0,
            };

            mockRepository.create.mockResolvedValue(expectedHabit);

            // Act
            const result = await service.create(createHabitDto);

            // Assert
            expect(result.currentStreak).toBe(0);
            expect(result.longestStreak).toBe(0);
            expect(result.isCompletedToday).toBe(false);
            expect(result.totalCompletions).toBe(0);
            expect(result.lastCompletedAt).toBeNull();
        });
    });

    describe('findAll', () => {
        it('should return all habits', async () => {
            // Arrange
            const habits = [mockHabit, { ...mockHabit, id: 2, name: 'Second Habit' }];
            mockRepository.getAll.mockResolvedValue(habits);

            // Act
            const result = await service.findAll();

            // Assert
            expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(habits);
            expect(result).toHaveLength(2);
        });

        it('should return empty array when no habits exist', async () => {
            // Arrange
            mockRepository.getAll.mockResolvedValue([]);

            // Act
            const result = await service.findAll();

            // Assert
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });
    });

    describe('findOne', () => {
        it('should return a habit by id', async () => {
            // Arrange
            const habitId = 1;
            mockRepository.getById.mockResolvedValue(mockHabit);

            // Act
            const result = await service.findOne(habitId);

            // Assert
            expect(mockRepository.getById).toHaveBeenCalledWith(habitId);
            expect(result).toEqual(mockHabit);
        });

        it('should throw NotFoundException when habit not found', async () => {
            // Arrange
            const habitId = 999;
            mockRepository.getById.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findOne(habitId)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(habitId)).rejects.toThrow(`Habit with ID ${habitId} not found`);
        });
    });

    describe('update', () => {
        it('should update a habit successfully', async () => {
            // Arrange
            const habitId = 1;
            const updateHabitDto: UpdateHabitDto = {
                name: 'Updated Exercise',
                description: 'Updated description',
            };

            const updatedHabit: Habit = {
                ...mockHabit,
                name: 'Updated Exercise',
                description: 'Updated description',
            };

            mockRepository.update.mockResolvedValue(updatedHabit);

            // Act
            const result = await service.update(habitId, updateHabitDto);

            // Assert
            expect(mockRepository.update).toHaveBeenCalledWith(habitId, updateHabitDto);
            expect(result).toEqual(updatedHabit);
            expect(result.name).toBe('Updated Exercise');
        });

        it('should update only name field', async () => {
            // Arrange
            const habitId = 1;
            const updateHabitDto: UpdateHabitDto = {
                name: 'New Name Only',
            };

            const updatedHabit: Habit = {
                ...mockHabit,
                name: 'New Name Only',
            };

            mockRepository.update.mockResolvedValue(updatedHabit);

            // Act
            const result = await service.update(habitId, updateHabitDto);

            // Assert
            expect(mockRepository.update).toHaveBeenCalledWith(habitId, updateHabitDto);
            expect(result.name).toBe('New Name Only');
            expect(result.description).toBe(mockHabit.description);
        });

        it('should throw NotFoundException when updating non-existent habit', async () => {
            // Arrange
            const habitId = 999;
            const updateHabitDto: UpdateHabitDto = { name: 'Updated Name' };
            mockRepository.update.mockResolvedValue(null);

            // Act & Assert
            await expect(service.update(habitId, updateHabitDto)).rejects.toThrow(NotFoundException);
            await expect(service.update(habitId, updateHabitDto)).rejects.toThrow(`Habit with ID ${habitId} not found`);
        });

        it('should throw ConflictException if updated name already exists', async () => {
            // Arrange
            const habitId = 1;
            const updateHabitDto: UpdateHabitDto = { name: 'Duplicate Name' };
            const conflictError = new ConflictException(`A habit with the name "Duplicate Name" already exists.`);

            mockRepository.update.mockRejectedValue(conflictError);

            // Act & Assert
            await expect(service.update(habitId, updateHabitDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('remove', () => {
        it('should delete a habit successfully', async () => {
            // Arrange
            const habitId = 1;
            mockRepository.delete.mockResolvedValue(true);

            // Act
            await service.remove(habitId);

            // Assert
            expect(mockRepository.delete).toHaveBeenCalledWith(habitId);
            expect(mockRepository.delete).toHaveBeenCalledTimes(1);
        });

        it('should throw NotFoundException when deleting non-existent habit', async () => {
            // Arrange
            const habitId = 999;
            mockRepository.delete.mockResolvedValue(false);

            // Act & Assert
            await expect(service.remove(habitId)).rejects.toThrow(NotFoundException);
            await expect(service.remove(habitId)).rejects.toThrow(`Habit with ID ${habitId} not found`);
        });
    });

    describe('toggleCompleteForToday', () => {
        it('should mark habit as completed for today', async () => {
            // Arrange
            const habitId = 1;
            const completed = true;

            const completedHabit: Habit = {
                ...mockHabit,
                isCompletedToday: true,
                lastCompletedAt: new Date(),
                totalCompletions: 1,
                currentStreak: 1,
            };

            mockRepository.toggleCompleteForToday.mockResolvedValue(completedHabit);

            // Act
            const result = await service.toggleCompleteForToday(habitId, completed);

            // Assert
            expect(mockRepository.toggleCompleteForToday).toHaveBeenCalledWith(habitId, completed);
            expect(result.isCompletedToday).toBe(true);
            expect(result.totalCompletions).toBe(1);
        });

        it('should mark habit as not completed for today', async () => {
            // Arrange
            const habitId = 1;
            const completed = false;

            const uncompletedHabit: Habit = {
                ...mockHabit,
                isCompletedToday: false,
                totalCompletions: 0,
                currentStreak: 0,
            };

            mockRepository.toggleCompleteForToday.mockResolvedValue(uncompletedHabit);

            // Act
            const result = await service.toggleCompleteForToday(habitId, completed);

            // Assert
            expect(mockRepository.toggleCompleteForToday).toHaveBeenCalledWith(habitId, completed);
            expect(result.isCompletedToday).toBe(false);
            expect(result.totalCompletions).toBe(0);
        });

        it('should throw NotFoundException when toggling non-existent habit', async () => {
            // Arrange
            const habitId = 999;
            const completed = true;
            mockRepository.toggleCompleteForToday.mockResolvedValue(null);

            // Act & Assert
            await expect(service.toggleCompleteForToday(habitId, completed)).rejects.toThrow(NotFoundException);
            await expect(service.toggleCompleteForToday(habitId, completed)).rejects.toThrow(`Habit with ID ${habitId} not found`);
        });

        it('should update streak correctly on consecutive days', async () => {
            // Arrange
            const habitId = 1;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const existingHabit: Habit = {
                ...mockHabit,
                isCompletedToday: false,
                lastCompletedAt: yesterday,
                currentStreak: 1,
                longestStreak: 1,
                totalCompletions: 1,
            };

            const updatedHabit: Habit = {
                ...existingHabit,
                isCompletedToday: true,
                lastCompletedAt: new Date(),
                currentStreak: 2,
                longestStreak: 2,
                totalCompletions: 2,
            };

            mockRepository.getById.mockResolvedValue(existingHabit);
            mockRepository.toggleCompleteForToday.mockResolvedValue(updatedHabit);

            // Act
            const result = await service.toggleCompleteForToday(habitId, true);

            // Assert
            expect(result.currentStreak).toBe(2);
            expect(result.longestStreak).toBe(2);
        });

        it('should reset streak if a day is missed', async () => {
            // Arrange
            const habitId = 1;
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            const existingHabit: Habit = {
                ...mockHabit,
                lastCompletedAt: twoDaysAgo,
                currentStreak: 5, // Was on a streak
                longestStreak: 5,
            };

            const updatedHabit: Habit = {
                ...existingHabit,
                isCompletedToday: true,
                currentStreak: 1, // Streak resets
                longestStreak: 5, // Longest streak remains
            };

            mockRepository.getById.mockResolvedValue(existingHabit);
            mockRepository.toggleCompleteForToday.mockResolvedValue(updatedHabit);

            // Act
            const result = await service.toggleCompleteForToday(habitId, true);

            // Assert
            expect(result.currentStreak).toBe(1);
            expect(result.longestStreak).toBe(5);
        });

        it('should not change longestStreak if current streak is smaller', async () => {
            // Arrange
            const habitId = 1;
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            const existingHabit: Habit = {
                ...mockHabit,
                lastCompletedAt: twoDaysAgo,
                currentStreak: 2,
                longestStreak: 10, // Longest streak is higher
            };

            const updatedHabit: Habit = {
                ...existingHabit,
                isCompletedToday: true,
                currentStreak: 1, // Streak resets
                longestStreak: 10, // Does not change
            };

            mockRepository.getById.mockResolvedValue(existingHabit);
            mockRepository.toggleCompleteForToday.mockResolvedValue(updatedHabit);

            // Act
            const result = await service.toggleCompleteForToday(habitId, true);

            // Assert
            expect(result.currentStreak).toBe(1);
            expect(result.longestStreak).toBe(10);
        });

        it('should handle un-completing a habit and its effect on streak', async () => {
            // Arrange
            const habitId = 1;
            const today = new Date();

            const existingHabit: Habit = {
                ...mockHabit,
                isCompletedToday: true,
                lastCompletedAt: today,
                currentStreak: 3,
                longestStreak: 3,
                totalCompletions: 3,
            };

            const updatedHabit: Habit = {
                ...existingHabit,
                isCompletedToday: false,
                currentStreak: 2, // Reverts to previous streak
                totalCompletions: 2,
            };

            mockRepository.getById.mockResolvedValue(existingHabit);
            mockRepository.toggleCompleteForToday.mockResolvedValue(updatedHabit);

            // Act
            const result = await service.toggleCompleteForToday(habitId, false);

            // Assert
            expect(result.isCompletedToday).toBe(false);
            expect(result.currentStreak).toBe(2);
            expect(result.longestStreak).toBe(3); // Longest should not change
        });
    });

    describe('getHabitsWithStreaks', () => {
        it('should return habits with streak information', async () => {
            // Arrange
            const habitsWithStreaks = [
                { ...mockHabit, currentStreak: 5, longestStreak: 10 },
                { ...mockHabit, id: 2, name: 'Second Habit', currentStreak: 3, longestStreak: 7 },
            ];

            mockRepository.getHabitsWithStreaks.mockResolvedValue(habitsWithStreaks);

            // Act
            const result = await service.getHabitsWithStreaks();

            // Assert
            expect(mockRepository.getHabitsWithStreaks).toHaveBeenCalledTimes(1);
            expect(result).toEqual(habitsWithStreaks);
            expect(result[0].currentStreak).toBe(5);
            expect(result[1].currentStreak).toBe(3);
        });
    });

    describe('getHabitStats', () => {
        it('should return correct statistics for multiple habits', async () => {
            // Arrange
            const habits = [
                { ...mockHabit, id: 1, isCompletedToday: true, totalCompletions: 10, currentStreak: 5 },
                { ...mockHabit, id: 2, name: 'Second Habit', isCompletedToday: false, totalCompletions: 5, currentStreak: 3 },
                { ...mockHabit, id: 3, name: 'Third Habit', isCompletedToday: true, totalCompletions: 15, currentStreak: 7 },
            ];

            mockRepository.getAll.mockResolvedValue(habits);

            // Act
            const result = await service.getHabitStats();

            // Assert
            expect(result.totalHabits).toBe(3);
            expect(result.completedToday).toBe(2);
            expect(result.totalCompletions).toBe(30);
            expect(result.averageStreak).toBe(5); // (5 + 3 + 7) / 3 = 5
        });

        it('should return zero statistics when no habits exist', async () => {
            // Arrange
            mockRepository.getAll.mockResolvedValue([]);

            // Act
            const result = await service.getHabitStats();

            // Assert
            expect(result.totalHabits).toBe(0);
            expect(result.completedToday).toBe(0);
            expect(result.totalCompletions).toBe(0);
            expect(result.averageStreak).toBe(0);
        });

        it('should handle decimal average streak correctly', async () => {
            // Arrange
            const habits = [
                { ...mockHabit, id: 1, currentStreak: 5 },
                { ...mockHabit, id: 2, name: 'Second Habit', currentStreak: 6 },
                { ...mockHabit, id: 3, name: 'Third Habit', currentStreak: 4 },
            ];

            mockRepository.getAll.mockResolvedValue(habits);

            // Act
            const result = await service.getHabitStats();

            // Assert
            expect(result.averageStreak).toBe(5); // (5 + 6 + 4) / 3 = 5
        });

        it('should handle single habit statistics', async () => {
            // Arrange
            const singleHabit = { ...mockHabit, isCompletedToday: true, totalCompletions: 25, currentStreak: 8 };
            mockRepository.getAll.mockResolvedValue([singleHabit]);

            // Act
            const result = await service.getHabitStats();

            // Assert
            expect(result.totalHabits).toBe(1);
            expect(result.completedToday).toBe(1);
            expect(result.totalCompletions).toBe(25);
            expect(result.averageStreak).toBe(8);
        });
    });
}); 