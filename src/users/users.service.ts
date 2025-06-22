import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  // Mock user data - in a real app, this would come from a database
  private readonly mockUser: User = {
    id: 1,
    username: 'testuser',
    // This is the encrypted version of 'password123'
    password: '$2a$10$GtUZnpHACFVQVs/HSSQaOekBglPqNm4BUUCdRDZbAz/DfKvSwbcsq',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  async findByUsername(username: string): Promise<User | null> {
    // For mock authentication, only return the hardcoded user
    if (username === this.mockUser.username) {
      return this.mockUser;
    }
    return null;
  }

  async findById(id: number): Promise<User | null> {
    if (id === this.mockUser.id) {
      return this.mockUser;
    }
    return null;
  }

  // Helper method to create a new mock user with encrypted password
  async createMockUser(username: string, plainPassword: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    return {
      id: 2,
      username,
      password: hashedPassword,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Original methods (keeping for compatibility)
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
