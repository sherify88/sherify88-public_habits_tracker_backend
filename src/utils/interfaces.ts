import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { BaseEntity, EntityManager, EntityMetadata, FindOptionsOrder, FindOptionsRelations, FindOptionsSelect, FindOptionsWhere } from 'typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { Shift_ar } from './enums';

export interface IRequestWithUser extends Request {
  user: User;
}
export enum Roles_En {
  Administrator = 'Administrator',
}


export interface ITokenPayload {
  id?: string;
}

export class IUploadedFile {
  name: string;
  path: string;
}






