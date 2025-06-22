import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Habit } from './entities/habit.entity';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { HabitStatsDto } from './dto/habit-stats.dto';
import { IHabitRepository } from './interfaces/habit-repository.interface';

@Injectable()
export class HabitsService {
    private readonly logger = new Logger(HabitsService.name);
    constructor(
        @Inject('IHabitRepository') private readonly habitRepository: IHabitRepository
    ) { }

    async findAll(): Promise<Habit[]> {
        this.logger.log('Calling HabitRepository.getAll() to fetch all habits.');
        const habits = await this.habitRepository.getAll();
        this.logger.log(`Found ${habits.length} habits.`);
        return habits;
    }

    async findOne(id: number): Promise<Habit> {
        const habit = await this.habitRepository.getById(id);
        if (!habit) {
            throw new NotFoundException(`Habit with ID ${id} not found`);
        }
        return habit;
    }

    async create(createHabitDto: CreateHabitDto): Promise<Habit> {
        return await this.habitRepository.create(createHabitDto);
    }

    async update(id: number, updateHabitDto: UpdateHabitDto): Promise<Habit> {
        const habit = await this.habitRepository.update(id, updateHabitDto);
        if (!habit) {
            throw new NotFoundException(`Habit with ID ${id} not found`);
        }
        return habit;
    }

    async remove(id: number): Promise<void> {
        const deleted = await this.habitRepository.delete(id);
        if (!deleted) {
            throw new NotFoundException(`Habit with ID ${id} not found`);
        }
    }

    async toggleCompleteForToday(id: number, completed: boolean): Promise<Habit> {
        const habit = await this.habitRepository.toggleCompleteForToday(id, completed);
        if (!habit) {
            throw new NotFoundException(`Habit with ID ${id} not found`);
        }
        return habit;
    }

    async getHabitsWithStreaks(): Promise<Habit[]> {
        return await this.habitRepository.getHabitsWithStreaks();
    }

    async getHabitStats(): Promise<HabitStatsDto> {
        const habits = await this.habitRepository.getAll();

        const totalHabits = habits.length;
        const completedToday = habits.filter(h => h.isCompletedToday).length;
        const totalCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0);
        const averageStreak = totalHabits > 0
            ? habits.reduce((sum, h) => sum + h.currentStreak, 0) / totalHabits
            : 0;

        return {
            totalHabits,
            completedToday,
            totalCompletions,
            averageStreak: Math.round(averageStreak * 100) / 100
        };
    }
} 