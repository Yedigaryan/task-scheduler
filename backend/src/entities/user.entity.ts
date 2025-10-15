import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Task } from './task.entity';
import { Availability } from './availability.entity';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 255 })
    email!: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 100 })
    username!: string;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 255 })
    passwordHash!: string;

    @OneToMany(() => Task, (task: Task) => task.assignee)
    tasks?: Task[];

    @OneToMany(() => Availability, (availability: Availability) => availability.user)
    availabilities?: Availability[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}


