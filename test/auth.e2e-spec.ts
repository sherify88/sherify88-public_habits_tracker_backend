import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupTestEnvironment, cleanupTestEnvironment, TEST_USER } from './test-setup';

describe('Authentication (e2e)', () => {
    let app: INestApplication;
    let authToken: string;

    beforeAll(async () => {
        // Setup test environment
        setupTestEnvironment();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        // Clean up test environment
        cleanupTestEnvironment();
        await app.close();
    });

    describe('/auth/login (POST)', () => {
        it('should login with valid credentials', async () => {
            const loginData = {
                username: TEST_USER.username,
                password: TEST_USER.password
            };

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('username', TEST_USER.username);
            expect(response.body).toHaveProperty('access_token');
            expect(typeof response.body.access_token).toBe('string');

            // Store token for other tests
            authToken = response.body.access_token;
        });

        it('should reject invalid username', async () => {
            const loginData = {
                username: 'wronguser',
                password: TEST_USER.password
            };

            await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginData)
                .expect(401);
        });

        it('should reject invalid password', async () => {
            const loginData = {
                username: TEST_USER.username,
                password: 'wrongpassword'
            };

            await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginData)
                .expect(401);
        });

        it('should reject empty username', async () => {
            const loginData = {
                username: '',
                password: TEST_USER.password
            };

            await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginData)
                .expect(401);
        });

        it('should reject empty password', async () => {
            const loginData = {
                username: TEST_USER.username,
                password: ''
            };

            await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginData)
                .expect(401);
        });

        it('should reject missing username', async () => {
            const loginData = {
                password: TEST_USER.password
            };

            await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginData)
                .expect(401);
        });

        it('should reject missing password', async () => {
            const loginData = {
                username: TEST_USER.username
            };

            await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginData)
                .expect(401);
        });
    });

    describe('/auth (GET) - Token validation', () => {
        it('should validate valid token', async () => {
            // First login to get a token
            const loginResponse = await request(app.getHttpServer())
                .post('/auth/login')
                .send(TEST_USER);

            const token = loginResponse.body.access_token;

            const response = await request(app.getHttpServer())
                .get('/auth')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body).toHaveProperty('id', 1);
            expect(response.body).toHaveProperty('username', TEST_USER.username);
        });

        it('should reject invalid token', async () => {
            await request(app.getHttpServer())
                .get('/auth')
                .set('Authorization', 'Bearer invalid.token.here')
                .expect(401);
        });

        it('should reject missing token', async () => {
            await request(app.getHttpServer())
                .get('/auth')
                .expect(401);
        });

        it('should reject malformed authorization header', async () => {
            await request(app.getHttpServer())
                .get('/auth')
                .set('Authorization', 'InvalidFormat')
                .expect(401);
        });
    });

    describe('Protected habits endpoints', () => {
        let validToken: string;

        beforeAll(async () => {
            // Get a valid token for testing protected endpoints
            const loginResponse = await request(app.getHttpServer())
                .post('/auth/login')
                .send(TEST_USER);
            validToken = loginResponse.body.access_token;
        });

        it('should allow access to habits with valid token', async () => {
            await request(app.getHttpServer())
                .get('/habits')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200);
        });

        it('should reject access to habits without token', async () => {
            await request(app.getHttpServer())
                .get('/habits')
                .expect(401);
        });

        it('should reject access to habits with invalid token', async () => {
            await request(app.getHttpServer())
                .get('/habits')
                .set('Authorization', 'Bearer invalid.token')
                .expect(401);
        });

        it('should allow creating habits with valid token', async () => {
            const habitData = {
                name: 'Unique Test Habit ' + Date.now(),
                description: 'A test habit for authentication testing'
            };

            await request(app.getHttpServer())
                .post('/habits')
                .set('Authorization', `Bearer ${validToken}`)
                .send(habitData)
                .expect(201);
        });

        it('should reject creating habits without token', async () => {
            const habitData = {
                name: 'Test Habit',
                description: 'A test habit for authentication testing'
            };

            await request(app.getHttpServer())
                .post('/habits')
                .send(habitData)
                .expect(401);
        });
    });
}); 