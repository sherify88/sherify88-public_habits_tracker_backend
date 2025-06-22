import { Request } from 'express';
import { User } from '../users/entities/user.entity';

export interface IRequestWithUser extends Request {
  user: User;
}
export enum Roles_En {
  Administrator = 'Administrator',
}


export interface ITokenPayload {
  sub: number; // User ID
  username: string;
  iat?: number; // Issued at
  exp?: number; // Expiration time
}

export class IUploadedFile {
  name: string;
  path: string;
}






