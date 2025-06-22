import { Module } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { HabitsController } from './habits.controller';
import { InMemoryHabitRepository } from './repositories/in-memory-habit.repository';
import { FileHabitRepository } from './repositories/file-habit.repository';
import { S3HabitRepository } from './repositories/s3-habit.repository';
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
                const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

                // In Lambda environment, use S3 repository
                if (isLambda) {
                    return new S3HabitRepository();
                }

                // In local development, use file storage if enabled, otherwise in-memory
                return useFileStorage ? new FileHabitRepository() : new InMemoryHabitRepository();
            },
            inject: [ConfigService],
        },
    ],
    exports: [HabitsService],
})
export class HabitsModule { } 