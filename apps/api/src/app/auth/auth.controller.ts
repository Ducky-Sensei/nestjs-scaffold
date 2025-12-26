import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { User } from '../user/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { GitHubAuthGuard } from './guards/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('register')
    async register(
        @Body() registerDto: RegisterDto,
        @Req() req: Request,
    ): Promise<AuthResponseDto> {
        return this.authService.register(registerDto, req);
    }

    @Public()
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('login')
    async login(@Body() loginDto: LoginDto, @Req() req: Request): Promise<AuthResponseDto> {
        return this.authService.login(loginDto, req);
    }

    @Get('me')
    async getMe(@CurrentUser() user: User) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            isActive: user.isActive,
            createdAt: user.createdAt,
        };
    }

    // Google OAuth
    @Public()
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth() {
        // Guard redirects to Google
    }

    @Public()
    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthCallback(@CurrentUser() user: User, @Req() req: Request, @Res() res: Response) {
        // Generate tokens
        const accessToken = (this.authService as any).generateToken(user);
        const refreshToken = await (this.authService as any).refreshTokenService.createRefreshToken(
            user,
            req.headers?.['user-agent'],
            req.ip,
        );

        // Return JSON with tokens
        return res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                authProvider: user.authProvider,
            },
        });
    }

    // GitHub OAuth
    @Public()
    @Get('github')
    @UseGuards(GitHubAuthGuard)
    async githubAuth() {
        // Guard redirects to GitHub
    }

    @Public()
    @Get('github/callback')
    @UseGuards(GitHubAuthGuard)
    async githubAuthCallback(@CurrentUser() user: User, @Req() req: Request, @Res() res: Response) {
        // Generate tokens
        const accessToken = (this.authService as any).generateToken(user);
        const refreshToken = await (this.authService as any).refreshTokenService.createRefreshToken(
            user,
            req.headers?.['user-agent'],
            req.ip,
        );

        // Return JSON with tokens
        return res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                authProvider: user.authProvider,
            },
        });
    }

    // Refresh Token
    @Public()
    @Post('refresh')
    async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
        return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
    }

    // Logout
    @Public()
    @Post('logout')
    async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ message: string }> {
        await this.authService.logout(refreshTokenDto.refreshToken);
        return { message: 'Logged out successfully' };
    }
}
