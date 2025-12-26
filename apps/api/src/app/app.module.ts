import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { redisStore } from 'cache-manager-redis-yet';
import { LoggerModule } from 'nestjs-pino';
import configuration, { type Configuration } from '../config/configuration';
import { validate } from '../config/env.validation';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { HealthModule } from './health/health.module';
import { OrganizationModule } from './organization/organization.module';
import { ProductController } from './product/product.controller';
import { Product } from './product/product.entity';
import { ProductService } from './product/product.service';
import { RbacModule } from './rbac/rbac.module';
import { ThemeModule } from './theme/theme.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            validate,
            validationOptions: {
                allowUnknown: true,
                abortEarly: false,
            },
        }),
        LoggerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService<Configuration, true>) => {
                const loggingConfig = configService.get('logging', { infer: true });
                const appConfig = configService.get('app', { infer: true });
                const prometheusConfig = configService.get('prometheus', { infer: true });

                return {
                    pinoHttp: {
                        level: loggingConfig.level,
                        transport:
                            appConfig.nodeEnv === 'development'
                                ? {
                                      target: 'pino-pretty',
                                      options: {
                                          colorize: true,
                                          translateTime: 'SYS:standard',
                                          ignore: 'pid,hostname',
                                      },
                                  }
                                : undefined,
                        autoLogging: {
                            ignore: (req) =>
                                req.url === '/health' ||
                                req.url === '/health/live' ||
                                req.url === prometheusConfig.path,
                        },
                        customProps: (req) => ({
                            requestId: req.id,
                        }),
                    },
                };
            },
        }),
        ThrottlerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService<Configuration, true>) => {
                const throttleConfig = configService.get('throttle', { infer: true });

                return [
                    {
                        ttl: throttleConfig.ttl,
                        limit: throttleConfig.limit,
                    },
                ];
            },
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService<Configuration, true>) => {
                const databaseConfig = configService.get('database', { infer: true });

                return {
                    type: 'postgres' as const,
                    host: databaseConfig.host,
                    port: databaseConfig.port,
                    username: databaseConfig.username,
                    password: databaseConfig.password,
                    database: databaseConfig.database,
                    logging: databaseConfig.logging,
                    entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
                    migrations: [`${__dirname}/../migrations/*{.ts,.js}`],
                    synchronize: false,
                    migrationsRun: true,
                    extra: {
                        max: databaseConfig.pool.max,
                        min: databaseConfig.pool.min,
                        idleTimeoutMillis: databaseConfig.pool.idleTimeoutMillis,
                        connectionTimeoutMillis: databaseConfig.pool.connectionTimeoutMillis,
                    },
                };
            },
        }),
        PrometheusModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService<Configuration, true>) => {
                const prometheusConfig = configService.get('prometheus', { infer: true });

                return {
                    defaultMetrics: {
                        enabled: prometheusConfig.enabled && prometheusConfig.defaultMetrics,
                    },
                    path: prometheusConfig.path,
                    defaultLabels: {
                        app: 'scaffold-service',
                    },
                };
            },
        }),
        CacheModule.registerAsync({
            isGlobal: true,
            inject: [ConfigService],
            useFactory: async (configService: ConfigService<Configuration, true>) => {
                const cacheConfig = configService.get('cache', { infer: true });

                if (!cacheConfig.enabled) {
                    console.log('[Cache] Caching disabled, using no-op cache');
                    return { ttl: 0, max: 0 };
                }

                if (cacheConfig.type === 'memory') {
                    console.log('[Cache] Using in-memory cache');
                    return {
                        ttl: cacheConfig.redis.ttl * 1000,
                        max: 100,
                    };
                }

                try {
                    console.log(
                        `[Cache] Connecting to Redis at ${cacheConfig.redis.host}:${cacheConfig.redis.port}`,
                    );

                    const store = await redisStore({
                        socket: {
                            host: cacheConfig.redis.host,
                            port: cacheConfig.redis.port,
                        },
                        password: cacheConfig.redis.password,
                        database: cacheConfig.redis.db,
                        ttl: cacheConfig.redis.ttl * 1000,
                    });

                    console.log('[Cache] Redis cache initialized successfully');
                    return { store };
                } catch (error) {
                    console.error(
                        `[Cache] Failed to connect to Redis, falling back to memory cache: ${error.message}`,
                    );
                    return {
                        ttl: cacheConfig.redis.ttl * 1000,
                        max: 100,
                    };
                }
            },
        }),
        TypeOrmModule.forFeature([Product]),
        AuthModule.forRoot(),
        RbacModule,
        HealthModule,
        OrganizationModule,
        ThemeModule,
    ],
    controllers: [AppController, ProductController],
    providers: [
        AppService,
        ProductService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
