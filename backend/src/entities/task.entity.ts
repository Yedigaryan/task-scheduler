import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'tasks' })
export class Task {
    @PrimaryGeneratedColumn()
    id!: number;

    @Index()
    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'text', nullable: true })
    description?: string | null;

    @Index()
    @Column({ type: 'enum', enum: ['pending', 'in_progress', 'completed'], default: 'pending' })
    status!: 'pending' | 'in_progress' | 'completed';

    @Index()
    @Column({ type: 'datetime' })
    startAt!: Date;

    @Index()
    @Column({ type: 'datetime' })
    endAt!: Date;

    @Index()
    @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE', nullable: false })
    assignee!: User;

    @Index()
    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}


