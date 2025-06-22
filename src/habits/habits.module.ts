import { Module } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { HabitsController } from './habits.controller';
import { InMemoryHabitRepository } from './repositories/in-memory-habit.repository';
import { FileHabitRepository } from './repositories/file-habit.repository';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [],
    controllers: [HabitsController],
    providers: [
        HabitsService,
        {
            provide: 'IHabitRepository',
            useFactory: (configService: ConfigService) => {
                const useFileStorage = configService.get('USE_FILE_STORAGE', 'false') === 'true';
                // In local development, use file storage if enabled, otherwise in-memory
                return useFileStorage ? new FileHabitRepository() : new InMemoryHabitRepository();
            },
            inject: [ConfigService],
        },
    ],
    exports: [HabitsService],
})
export class HabitsModule { } 