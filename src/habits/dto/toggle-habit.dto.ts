import { IsBoolean } from 'class-validator';

export class ToggleHabitDto {
    @IsBoolean()
    completed: boolean;
} 