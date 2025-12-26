import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Configuration } from '../../../config/configuration';
import { User } from '../../user/user.entity';
import { AuthService } from '../auth.service';

export interface JwtPayload {
    sub: string;
    email: string;
    roles: Array<{
        id: string;
        name: string;
        permissions: Array<{
            resource: string;
            action: string;
        }>;
    }>;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
        readonly configService: ConfigService<Configuration, true>,
    ) {
        const authConfig = configService.get('auth', { infer: true });

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: authConfig.jwtSecret,
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const user = await this.authService.validateUser(payload.sub);

        if (!user) {
            throw new UnauthorizedException('User not found or inactive');
        }

        return user;
    }
}
