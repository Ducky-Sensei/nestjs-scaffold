import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MoreThan, Repository } from 'typeorm';
import type { Configuration } from '../../../config/configuration';
import { User } from '../../user/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
    constructor(
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
        private readonly configService: ConfigService<Configuration, true>,
    ) {}

    /**
     * Generate a cryptographically secure random token
     */
    private generateToken(): string {
        return crypto.randomBytes(40).toString('hex');
    }

    /**
     * Create and store a refresh token for a user
     */
    async createRefreshToken(user: User, userAgent?: string, ipAddress?: string): Promise<string> {
        const authConfig = this.configService.get('auth', { infer: true });
        const token = this.generateToken();
        const tokenHash = await bcrypt.hash(token, 10);

        // Parse expiration (e.g., '30d' -> 30 days)
        const expiresIn = this.parseExpirationString(authConfig.jwtRefreshExpiresIn);
        const expiresAt = new Date(Date.now() + expiresIn);

        const refreshToken = this.refreshTokenRepository.create({
            tokenHash,
            userId: user.id,
            expiresAt,
            userAgent,
            ipAddress,
        });

        await this.refreshTokenRepository.save(refreshToken);

        return token;
    }

    /**
     * Validate refresh token and return associated user
     */
    async validateRefreshToken(token: string): Promise<User> {
        // Find all non-revoked, non-expired tokens
        const storedTokens = await this.refreshTokenRepository.find({
            where: {
                isRevoked: false,
                expiresAt: MoreThan(new Date()),
            },
            relations: ['user', 'user.roles', 'user.roles.permissions'],
        });

        // Check each token hash (necessary because we can't query by hash)
        for (const storedToken of storedTokens) {
            const isValid = await bcrypt.compare(token, storedToken.tokenHash);
            if (isValid) {
                // Verify not expired
                if (storedToken.expiresAt < new Date()) {
                    throw new UnauthorizedException('Refresh token expired');
                }

                // Verify user is active
                if (!storedToken.user.isActive) {
                    throw new UnauthorizedException('User account is not active');
                }

                return storedToken.user;
            }
        }

        throw new UnauthorizedException('Invalid refresh token');
    }

    /**
     * Revoke a refresh token (for logout)
     */
    async revokeRefreshToken(token: string): Promise<void> {
        const storedTokens = await this.refreshTokenRepository.find({
            where: { isRevoked: false },
        });

        for (const storedToken of storedTokens) {
            const isValid = await bcrypt.compare(token, storedToken.tokenHash);
            if (isValid) {
                storedToken.isRevoked = true;
                await this.refreshTokenRepository.save(storedToken);
                return;
            }
        }
    }

    /**
     * Revoke all refresh tokens for a user
     */
    async revokeAllUserTokens(userId: string): Promise<void> {
        await this.refreshTokenRepository.update({ userId, isRevoked: false }, { isRevoked: true });
    }

    /**
     * Clean up expired tokens (can be run periodically)
     */
    async cleanupExpiredTokens(): Promise<number> {
        const result = await this.refreshTokenRepository.delete({
            expiresAt: MoreThan(new Date()),
        });

        return result.affected || 0;
    }

    /**
     * Parse expiration string like '30d', '7d', '1h' to milliseconds
     */
    private parseExpirationString(expiresIn: string): number {
        const unit = expiresIn.slice(-1);
        const value = parseInt(expiresIn.slice(0, -1), 10);

        switch (unit) {
            case 'd':
                return value * 24 * 60 * 60 * 1000;
            case 'h':
                return value * 60 * 60 * 1000;
            case 'm':
                return value * 60 * 1000;
            case 's':
                return value * 1000;
            default:
                throw new Error(`Invalid expiration format: ${expiresIn}`);
        }
    }
}
