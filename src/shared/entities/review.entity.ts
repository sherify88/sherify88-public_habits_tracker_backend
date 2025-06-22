import { IUploadedFile } from '../../utils/interfaces';
import { Index, Column } from 'typeorm';
import { BaseWithPK } from './base-with-primary-id.entity';

@Index(['id'], { unique: true })
export class Review extends BaseWithPK {
  @Column('integer', { default: 1 })
  rating: number;

  @Column({ nullable: true })
  feedback: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  photo: IUploadedFile;
}
