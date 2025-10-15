import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(username: string, password: string) {
        const user = await this.usersService.findByUsername(username);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const ok = await this.usersService.validatePassword(password, user.passwordHash);
        if (!ok) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return user;
    }

    async login(username: string, password: string) {
        const user = await this.validateUser(username, password);
        const payload = { sub: user.id, username: user.username };
        const access_token = await this.jwtService.signAsync(payload);
        return { access_token };
    }
}


