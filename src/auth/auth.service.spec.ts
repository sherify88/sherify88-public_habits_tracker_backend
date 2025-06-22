import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;

    const mockUser: User = {
        id: 1,
        username: 'testuser',
        password: 'hashed_password', // Simplified for testing
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockUsersService = {
        findByUsername: jest.fn(),
        findById: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);

        // Mock the verifyPassword method using jest.spyOn
        jest.spyOn(service as any, 'verifyPassword').mockImplementation((plainPassword: string, hashedPassword: string) => {
            return plainPassword === 'password123';
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('should return user when valid credentials are provided', async () => {
            mockUsersService.findByUsername.mockResolvedValue(mockUser);

            const result = await service.validateUser('testuser', 'password123');

            expect(result).toEqual(mockUser);
            expect(mockUsersService.findByUsername).toHaveBeenCalledWith('testuser');
        });

        it('should return null when user does not exist', async () => {
            mockUsersService.findByUsername.mockResolvedValue(null);

            const result = await service.validateUser('nonexistent', 'password123');

            expect(result).toBeNull();
            expect(mockUsersService.findByUsername).toHaveBeenCalledWith('nonexistent');
        });

        it('should return null when user is inactive', async () => {
            const inactiveUser = { ...mockUser, isActive: false };
            mockUsersService.findByUsername.mockResolvedValue(inactiveUser);

            const result = await service.validateUser('testuser', 'password123');

            expect(result).toBeNull();
        });

        it('should return null when password is incorrect', async () => {
            mockUsersService.findByUsername.mockResolvedValue(mockUser);

            const result = await service.validateUser('testuser', 'wrongpassword');

            expect(result).toBeNull();
        });

        it('should return null when user service throws an error', async () => {
            mockUsersService.findByUsername.mockRejectedValue(new Error('Database error'));

            const result = await service.validateUser('testuser', 'password123');

            expect(result).toBeNull();
        });
    });

    describe('login', () => {
        it('should return user info and access token', async () => {
            const mockToken = 'mock.jwt.token';
            mockJwtService.sign.mockReturnValue(mockToken);

            const result = await service.login(mockUser);

            expect(result).toEqual({
                id: mockUser.id,
                username: mockUser.username,
                access_token: mockToken,
            });
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                username: mockUser.username,
            });
        });
    });

    describe('validateTokenPayload', () => {
        it('should return user when valid payload is provided', async () => {
            const payload = { sub: 1, username: 'testuser' };
            mockUsersService.findById.mockResolvedValue(mockUser);

            const result = await service.validateTokenPayload(payload);

            expect(result).toEqual(mockUser);
            expect(mockUsersService.findById).toHaveBeenCalledWith(1);
        });

        it('should return null when user does not exist', async () => {
            const payload = { sub: 999, username: 'nonexistent' };
            mockUsersService.findById.mockResolvedValue(null);

            const result = await service.validateTokenPayload(payload);

            expect(result).toBeNull();
            expect(mockUsersService.findById).toHaveBeenCalledWith(999);
        });
    });
}); 