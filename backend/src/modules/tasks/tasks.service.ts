import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Task } from '../../entities/task.entity';
import { User } from '../../entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { log } from 'console';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task) private readonly tasksRepo: Repository<Task>,
        @InjectRepository(User) private readonly usersRepo: Repository<User>,
        private readonly events: EventEmitter2,
    ) { }

    async list(params: { status?: Task['status']; assigneeId?: number }) {
        const qb = this.tasksRepo.createQueryBuilder('task')
            .leftJoinAndSelect('task.assignee', 'assignee');
        if (params.status) qb.andWhere('task.status = :status', { status: params.status });
        if (params.assigneeId) qb.andWhere('assignee.id = :assigneeId', { assigneeId: params.assigneeId });
        return qb.orderBy('task.createdAt', 'DESC').getMany();
    }

    async getOne(id: number) {
        const task = await this.tasksRepo.findOne({ where: { id }, relations: { assignee: true } });
        if (!task) throw new NotFoundException('Task not found');
        return task;
    }

    async ensureNoOverlapOrThrow(assigneeId: number, startAt: Date, endAt: Date, ignoreTaskId?: number) {
        if (startAt >= endAt) throw new BadRequestException('startAt must be before endAt');
        const qb = this.tasksRepo.createQueryBuilder('task')
            .leftJoin('task.assignee', 'assignee')
            .where('assignee.id = :assigneeId', { assigneeId })
            .andWhere('(task.startAt < :endAt AND task.endAt > :startAt)', { startAt, endAt });
        if (ignoreTaskId) qb.andWhere('task.id <> :ignoreTaskId', { ignoreTaskId });
        const conflict = await qb.getExists();
        if (conflict) throw new BadRequestException('Task overlaps with existing assignment');
    }

    async create(dto: CreateTaskDto) {
        const assignee = await this.usersRepo.findOne({ where: { id: dto.assigneeId } });
        if (!assignee) throw new BadRequestException('Assignee not found');
        const startAt = new Date(dto.startAt);
        const endAt = new Date(dto.endAt);
        await this.ensureNoOverlapOrThrow(assignee.id, startAt, endAt);
        const task = this.tasksRepo.create({
            title: dto.title,
            description: dto.description,
            status: dto.status ?? 'pending',
            assignee,
            startAt,
            endAt,
        });
        const saved = await this.tasksRepo.save(task);
        this.events.emit('task.created', saved);
        return saved;
    }

    async update(id: number, dto: UpdateTaskDto) {
        const task = await this.tasksRepo.findOne({ where: { id }, relations: { assignee: true } });
        if (!task) throw new NotFoundException('Task not found');
        if (dto.startAt || dto.endAt) {
            const startAt = dto.startAt ? new Date(dto.startAt) : task.startAt;
            const endAt = dto.endAt ? new Date(dto.endAt) : task.endAt;
            await this.ensureNoOverlapOrThrow(task.assignee.id, startAt, endAt, task.id);
            task.startAt = startAt;
            task.endAt = endAt;
        }
        if (dto.title !== undefined) task.title = dto.title;
        if (dto.description !== undefined) task.description = dto.description;
        if (dto.status !== undefined) task.status = dto.status;
        const saved = await this.tasksRepo.save(task);
        this.events.emit('task.updated', saved);
        return saved;
    }

    async reassign(id: number, newAssigneeId: number) {
        const task = await this.tasksRepo.findOne({ where: { id }, relations: { assignee: true } });
        if (!task) throw new NotFoundException('Task not found');
        if (task.assignee.id === newAssigneeId) return task;
        const assignee = await this.usersRepo.findOne({ where: { id: newAssigneeId } });
        if (!assignee) throw new BadRequestException('Assignee not found');
        await this.ensureNoOverlapOrThrow(assignee.id, task.startAt, task.endAt, task.id);
        task.assignee = assignee;
        return this.tasksRepo.save(task);
    }

    async delete(id: number) {
        const task = await this.tasksRepo.findOne({ where: { id } });
        if (!task) return { affected: 0 };
        const result = await this.tasksRepo.delete(id);
        if (result.affected) this.events.emit('task.deleted', { id });
        return result;
    }

    async search(query: string) {
        const qb = this.tasksRepo.createQueryBuilder('task');
        log(qb.getQueryAndParameters());
        // qb.where('task.title LIKE :q OR task.description LIKE :q', { q: `%${query}%` });
        // return qb.orderBy('task.createdAt', 'DESC').getMany();
        return [];
    }
}


