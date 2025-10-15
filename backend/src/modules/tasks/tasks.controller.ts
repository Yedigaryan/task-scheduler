import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Get()
    async list(
        @Query('status') status?: 'pending' | 'in_progress' | 'completed',
        @Query('assignee') assigneeId?: string,
    ) {
        return this.tasksService.list({ status, assigneeId: assigneeId ? Number(assigneeId) : undefined });
    }

    @Post()
    async create(@Body() dto: CreateTaskDto) {
        return this.tasksService.create(dto);
    }

    @Get(':id')
    async getOne(@Param('id', ParseIntPipe) id: number) {
        return this.tasksService.getOne(id);
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto) {
        return this.tasksService.update(id, dto);
    }

    @Put(':id/reassign')
    async reassign(
        @Param('id', ParseIntPipe) id: number,
        @Body('assigneeId', ParseIntPipe) assigneeId: number,
    ) {
        return this.tasksService.reassign(id, assigneeId);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.tasksService.delete(id);
    }

    @Get('search')
    async search(@Query('q') q: string) {
        return this.tasksService.search(q ?? '');
    }
}


