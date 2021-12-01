import { Controller, Post, UseGuards, Request, Get, SerializeOptions } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthGuardJwt } from "./auth-guard.jwt";
import { AuthGuardLocal } from "./auth-guard.local";
import { AuthService } from "./auth.service";
import { CurrenteUser } from "./current-user.decorator";
import { User } from "./user.entity";

@Controller('auth')
@SerializeOptions({ strategy: 'excludeAll' })
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('login')
    @UseGuards(AuthGuardLocal)
    async login(@CurrenteUser() user: User) {
        return {
            userId: user.id,
            token: this.authService.getTokenForUser(user)   
        };
    }

    @Get('profile')
    @UseGuards(AuthGuardJwt)
    async getProfile(@CurrenteUser() user: User) {
        return user;
    }
}