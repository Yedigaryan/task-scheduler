import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'availabilities' })
export class Availability {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'date' })
    date!: string; // YYYY-MM-DD

    @Column({ type: 'time' })
    startTime!: string; // HH:MM:SS

    @Column({ type: 'time' })
    endTime!: string; // HH:MM:SS

    @ManyToOne(() => User, (user) => user.availabilities, { onDelete: 'CASCADE' })
    user!: User;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}
