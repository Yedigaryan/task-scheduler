import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
    ) { }

    async findById(id: number): Promise<User | null> {
        return this.usersRepo.findOne({ where: { id } });
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.usersRepo.findOne({ where: { username } });
    }

    async validatePassword(password: string, passwordHash: string): Promise<boolean> {
        return bcrypt.compare(password, passwordHash);
    }
}


