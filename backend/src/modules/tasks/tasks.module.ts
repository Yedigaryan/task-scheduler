import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Task } from '../../entities/task.entity';
import { User } from '../../entities/user.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TasksAvailabilityListener } from './tasksAvailability.listener';
import { Availability } from '../../entities/availability.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Task, User, Availability]), EventEmitterModule.forRoot()],
    providers: [TasksService, TasksAvailabilityListener],
    controllers: [TasksController],
})
export class TasksModule { }


