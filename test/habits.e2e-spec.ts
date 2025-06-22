import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateHabitDto } from '../src/habits/dto/create-habit.dto';

describe('HabitsController (e2e)', () => {
    let app: INestApplication;
    let habitId: number;

    beforeAll(async () => {
        // Force in-memory repository for e2e tests
        process.env.USE_FILE_STORAGE = 'false';
        process.env.USE_DATABASE = 'false';

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe()); // Ensure validation pipe is used
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should be defined', () => {
        expect(app).toBeDefined();
    });

    describe('/habits', () => {
        it('GET /habits -> should return an empty array initially', () => {
            return request(app.getHttpServer())
                .get('/habits')
                .expect(200)
                .expect([]);
        });

        it('POST /habits -> should create a new habit', () => {
            const createHabitDto: CreateHabitDto = {
                name: 'E2E Test Habit',
                description: 'A habit created for e2e testing.',
            };

            return request(app.getHttpServer())
                .post('/habits')
                .send(createHabitDto)
                .expect(201)
                .then((res) => {
                    expect(res.body).toEqual({
                        id: expect.any(Number),
                        name: createHabitDto.name,
                        description: createHabitDto.description,
                        currentStreak: 0,
                        longestStreak: 0,
                        lastCompletedAt: null,
                        isCompletedToday: false,
                        totalCompletions: 0,
                        createdDate: expect.any(String),
                        updatedDate: expect.any(String),
                        deletedDate: null,
                        createdById: null,
                        updatedById: null,
                    });
                    habitId = res.body.id; // Save for later tests
                });
        });

        it('POST /habits -> should fail with invalid data', () => {
            return request(app.getHttpServer())
                .post('/habits')
                .send({ description: 'Missing name' }) // Invalid DTO
                .expect(400);
        });

        it('POST /habits -> should fail to create a habit with a duplicate name', () => {
            const createHabitDto: CreateHabitDto = {
                name: 'E2E Test Habit', // Same name as the one created above
                description: 'This should fail.',
            };

            return request(app.getHttpServer())
                .post('/habits')
                .send(createHabitDto)
                .expect(409) // Conflict
                .then((res) => {
                    expect(res.body.message).toContain('already exists');
                });
        });

        it('GET /habits -> should return an array with the newly created habit', async () => {
            const response = await request(app.getHttpServer())
                .get('/habits')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].name).toBe('E2E Test Habit');
        });

        it('GET /habits/:id -> should return the specific habit', () => {
            return request(app.getHttpServer())
                .get(`/habits/${habitId}`)
                .expect(200)
                .then((res) => {
                    expect(res.body.id).toBe(habitId);
                    expect(res.body.name).toBe('E2E Test Habit');
                });
        });

        it('PATCH /habits/:id/toggle -> should mark habit as complete', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/habits/${habitId}/toggle`)
                .send({ completed: true })
                .expect(200);

            expect(response.body.isCompletedToday).toBe(true);
            expect(response.body.totalCompletions).toBe(1);
            expect(response.body.currentStreak).toBe(1);
            expect(response.body.longestStreak).toBe(1);
        });

        it('PATCH /habits/:id/toggle -> should mark habit as not complete', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/habits/${habitId}/toggle`)
                .send({ completed: false })
                .expect(200);

            expect(response.body.isCompletedToday).toBe(false);
            expect(response.body.totalCompletions).toBe(0);
            // Note: The streak logic for un-completing is simplified in the repo
            // A more complex implementation might be needed for perfect accuracy here
        });

        it('PATCH /habits/:id -> should update the habit', async () => {
            const updatedData = { name: 'Updated E2E Habit' };
            const response = await request(app.getHttpServer())
                .patch(`/habits/${habitId}`)
                .send(updatedData)
                .expect(200);

            expect(response.body.name).toBe('Updated E2E Habit');
        });

        it('PATCH /habits/:id -> should fail to update to a duplicate name', async () => {
            // Create a second habit to create a name conflict
            const secondHabitDto: CreateHabitDto = { name: 'Second E2E Habit' };
            const res = await request(app.getHttpServer())
                .post('/habits')
                .send(secondHabitDto)
                .expect(201);

            const secondHabitId = res.body.id;

            // Try to update the first habit to have the same name as the second one
            const updateToDuplicate = { name: 'Second E2E Habit' };
            await request(app.getHttpServer())
                .patch(`/habits/${habitId}`)
                .send(updateToDuplicate)
                .expect(409); // Conflict

            // Clean up the second habit to not interfere with other tests
            await request(app.getHttpServer())
                .delete(`/habits/${secondHabitId}`)
                .expect(204);
        });

        it('DELETE /habits/:id -> should delete the habit', () => {
            return request(app.getHttpServer())
                .delete(`/habits/${habitId}`)
                .expect(204);
        });

        it('GET /habits/:id -> should return 404 after deletion', () => {
            return request(app.getHttpServer())
                .get(`/habits/${habitId}`)
                .expect(404);
        });

        it('GET /habits -> should return an empty array after deletion', () => {
            return request(app.getHttpServer())
                .get('/habits')
                .expect(200)
                .expect([]);
        });

        it('GET /habits/stats -> should return stats', () => {
            return request(app.getHttpServer())
                .get('/habits/stats')
                .expect(200)
                .then((res) => {
                    expect(res.body).toEqual({
                        totalHabits: expect.any(Number),
                        completedToday: expect.any(Number),
                        totalCompletions: expect.any(Number),
                        averageStreak: expect.any(Number),
                    });
                });
        });
    });
}); 