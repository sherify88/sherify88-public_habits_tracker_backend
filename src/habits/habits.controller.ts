import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
    Logger,
} from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { ToggleHabitDto } from './dto/toggle-habit.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('habits')
export class HabitsController {
    private readonly logger = new Logger(HabitsController.name);
    constructor(private readonly habitsService: HabitsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createHabitDto: CreateHabitDto) {
        return this.habitsService.create(createHabitDto);
    }

    @Get()
    findAll() {
        this.logger.log('Received request to GET /habits');
        return this.habitsService.findAll();
    }

    @Get('stats')
    getStats() {
        return this.habitsService.getHabitStats();
    }

    @Get('streaks')
    getHabitsWithStreaks() {
        return this.habitsService.getHabitsWithStreaks();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.habitsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateHabitDto: UpdateHabitDto) {
        return this.habitsService.update(id, updateHabitDto);
    }

    @Patch(':id/toggle')
    toggleCompleteForToday(
        @Param('id', ParseIntPipe) id: number,
        @Body() toggleHabitDto: ToggleHabitDto
    ) {
        return this.habitsService.toggleCompleteForToday(id, toggleHabitDto.completed);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.habitsService.remove(id);
    }
} 