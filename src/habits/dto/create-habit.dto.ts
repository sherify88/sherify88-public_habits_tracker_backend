import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateHabitDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
} 