import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
    ) { }

    @Get()
    async list(): Promise<User[]> {
        return await this.usersRepo.find({select: {id: true, username: true, name: true}});
    }
}


