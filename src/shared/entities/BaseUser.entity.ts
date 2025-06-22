import { User } from '../../users/entities/user.entity';
import { IUploadedFile } from '../../utils/interfaces';
import { AfterLoad } from 'typeorm';
import { BaseWithPK } from './base-with-primary-id.entity';

export class BaseUser extends BaseWithPK {
  phone: string;

  email: string;

  username: string;

  firstName: string;

  lastName?: string;

  fcmtoken?: string;
  ostype?: string;

  photo?: IUploadedFile;

  basicInfo: User;


}
