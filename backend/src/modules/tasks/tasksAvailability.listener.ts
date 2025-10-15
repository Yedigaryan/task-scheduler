import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { Availability } from '../../entities/availability.entity';

function formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

@Injectable()
export class TasksAvailabilityListener {
    constructor(
        @InjectRepository(Availability) private readonly availabilityRepo: Repository<Availability>,
    ) { }

    private splitIntoDays(task: Task): Array<{ date: string; startTime: string; endTime: string }> {
        const start = new Date(task.startAt);
        const end = new Date(task.endAt);
        const segments: Array<{ date: string; startTime: string; endTime: string }> = [];
        const cur = new Date(start);
        while (cur <= end) {
            const day = new Date(cur);
            const dayStart = new Date(day);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(day);
            dayEnd.setHours(23, 59, 59, 999);
            const segStart = new Date(Math.max(start.getTime(), dayStart.getTime()));
            const segEnd = new Date(Math.min(end.getTime(), dayEnd.getTime()));
            const date = formatDate(day);
            const startTime = segStart.toTimeString().slice(0, 8);
            const endTime = segEnd.toTimeString().slice(0, 8);
            segments.push({ date, startTime, endTime });
            cur.setDate(cur.getDate() + 1);
        }
        return segments;
    }

    private async refreshForTask(task: Task) {
        if (!task.assignee || !task.assignee.id) return;
        // Remove existing rows for the task's date span for this user
        const startDate = formatDate(new Date(task.startAt));
        const endDate = formatDate(new Date(task.endAt));
        await this.availabilityRepo.createQueryBuilder()
            .delete()
            .from(Availability)
            .where('userId = :userId', { userId: (task.assignee as any).id })
            .andWhere('date BETWEEN :start AND :end', { start: startDate, end: endDate })
            .execute();
        // Insert new segments
        const segments = this.splitIntoDays(task);
        if (segments.length === 0) return;
        const rows = segments.map((s) => this.availabilityRepo.create({
            user: { id: (task.assignee as any).id } as any,
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
        }));
        await this.availabilityRepo.save(rows);
    }

    @OnEvent('task.created')
    async onCreated(task: Task) {
        await this.refreshForTask(task);
    }

    @OnEvent('task.updated')
    async onUpdated(task: Task) {
        await this.refreshForTask(task);
    }

    @OnEvent('task.deleted')
    async onDeleted(payload: { id: number }) {
        // Best effort: delete any availability entries which referenced the task range is unknown; skip for simplicity
        // In a full model we'd store taskId on availability rows to delete precisely.
    }
}


