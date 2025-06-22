import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Meta {
	@PrimaryGeneratedColumn('uuid') id: number;

	@Column({ type: 'double precision', default: 0 })
	merchantInvitationEarning: number;
}
