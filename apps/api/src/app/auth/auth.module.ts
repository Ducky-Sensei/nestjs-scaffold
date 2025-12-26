import { type DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { Configuration } from '../../config/configuration';
import { RbacModule } from '../rbac/rbac.module';
import { User } from '../user/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenService } from './services/refresh-token.service';
import { GitHubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({})
export class AuthModule {
    static forRoot(): DynamicModule {
        const providers = [AuthService, RefreshTokenService, JwtStrategy];

        return {
            module: AuthModule,
            imports: [
                TypeOrmModule.forFeature([User, RefreshToken]),
                PassportModule,
                RbacModule,
                JwtModule.registerAsync({
                    inject: [ConfigService],
                    useFactory: (
                        configService: ConfigService<Configuration, true>,
                    ): JwtModuleOptions => {
                        const authConfig = configService.get('auth', { infer: true });

                        return {
                            secret: authConfig.jwtSecret,
                            signOptions: {
                                expiresIn: authConfig.jwtExpiresIn,
                            },
                        } as JwtModuleOptions;
                    },
                }),
            ],
            controllers: [AuthController],
            providers: [
                ...providers,
                {
                    provide: GoogleStrategy,
                    useFactory: (
                        authService: AuthService,
                        configService: ConfigService<Configuration, true>,
                    ) => {
                        const authConfig = configService.get('auth', { infer: true });
                        // Only register Google strategy if credentials are configured
                        if (authConfig.google.clientId && authConfig.google.clientSecret) {
                            return new GoogleStrategy(authService, configService);
                        }
                        return null;
                    },
                    inject: [AuthService, ConfigService],
                },
                {
                    provide: GitHubStrategy,
                    useFactory: (
                        authService: AuthService,
                        configService: ConfigService<Configuration, true>,
                    ) => {
                        const authConfig = configService.get('auth', { infer: true });
                        // Only register GitHub strategy if credentials are configured
                        if (authConfig.github.clientId && authConfig.github.clientSecret) {
                            return new GitHubStrategy(authService, configService);
                        }
                        return null;
                    },
                    inject: [AuthService, ConfigService],
                },
            ],
            exports: [AuthService, RefreshTokenService],
        };
    }
}
