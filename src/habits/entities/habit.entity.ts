import { BaseWithPK } from "src/shared/entities/base-with-primary-id.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class Habit extends BaseWithPK {
    @Column({ nullable: false, unique: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    // Store only the last completion date and streak info
    @Column({ type: 'timestamp without time zone', nullable: true })
    lastCompletedAt: Date;

    @Column({ type: 'int', default: 0 })
    currentStreak: number;

    @Column({ type: 'int', default: 0 })
    longestStreak: number;

    @Column({ type: 'boolean', default: false })
    isCompletedToday: boolean;

    // Optional: Store completion count for statistics
    @Column({ type: 'int', default: 0 })
    totalCompletions: number;
} 