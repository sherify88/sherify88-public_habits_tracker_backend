import { Column } from 'typeorm';

export class File {
  @Column({ nullable: true })
  mimetype?: string;

  @Column()
  path: string;

  @Column({ nullable: true })
  originalname?: string;

  @Column()
  filename: string;
}
