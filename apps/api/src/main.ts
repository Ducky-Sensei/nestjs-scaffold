// NOTE: Load environment variables FIRST, before any instrumentation
import { config } from 'dotenv';

config();

// NOTE: Initialize Datadog IMMEDIATELY after env vars (must be before any other imports)
// Datadog's tracer must be loaded first to properly instrument all modules
import { initializeDatadog } from './config/datadog';

initializeDatadog({
    enabled: process.env.DATADOG_ENABLED === 'true',
    serviceName: process.env.DATADOG_SERVICE_NAME || 'scaffold-service',
    env: process.env.DATADOG_ENV || process.env.NODE_ENV || 'development',
    version: process.env.DATADOG_VERSION || '1.0.0',
    agentHost: process.env.DATADOG_AGENT_HOST || 'localhost',
    agentPort: parseInt(process.env.DATADOG_AGENT_PORT || '8126', 10),
    runtimeMetricsEnabled: process.env.DATADOG_RUNTIME_METRICS_ENABLED !== 'false',
    profilingEnabled: process.env.DATADOG_PROFILING_ENABLED === 'true',
});

import { initializeSentry } from './config/sentry';

initializeSentry({
    enabled: process.env.SENTRY_ENABLED === 'true',
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '1.0'),
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '1.0'),
});

// NOTE: Load OpenTelemetry instrumentation after Sentry/Datadog
import './config/instrumentations';

import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app/app.module';
import type { Configuration } from './config/configuration';
import { flushDatadog } from './config/datadog';
import { flushSentry } from './config/sentry';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { RequestIdMiddleware } from './middleware/request-id.middleware';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    const configService = app.get(ConfigService<Configuration, true>);
    const appConfig = configService.get('app', { infer: true });
    const securityConfig = configService.get('security', { infer: true });

    app.enableShutdownHooks();

    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    // Strict CSP to prevent XSS and other injection attacks
    if (appConfig.nodeEnv === 'production') {
        app.use(
            helmet({
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ["'self'"],
                        baseUri: ["'self'"],
                        fontSrc: ["'self'", 'https:', 'data:'],
                        formAction: ["'self'"],
                        frameAncestors: ["'self'"],
                        imgSrc: ["'self'", 'data:', 'https:'],
                        objectSrc: ["'none'"],
                        scriptSrc: ["'self'"],
                        scriptSrcAttr: ["'none'"],
                        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
                        upgradeInsecureRequests: [],
                    },
                },
            }),
        );
    }

    // Apply body size limits to prevent DOS attacks via large payloads
    app.use(json({ limit: securityConfig.bodyLimit }));
    app.use(urlencoded({ extended: true, limit: securityConfig.bodyLimit }));

    // Apply request ID middleware
    app.use(RequestIdMiddleware);

    app.enableCors({
        origin: securityConfig.corsOrigin.split(',').map((o) => o.trim()),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    app.useGlobalFilters(new HttpExceptionFilter());

    // Enable global validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    await app.listen(appConfig.port, '0.0.0.0');
    Logger.log(`🚀 Server started on http://localhost:${appConfig.port}`);

    // Handle graceful shutdown
    const shutdown = async (signal: string) => {
        Logger.log(`${signal} received, closing server gracefully...`);
        try {
            // Flush monitoring services before closing
            await Promise.allSettled([flushSentry(2000), flushDatadog()]);

            await app.close();
            Logger.log('Server closed successfully');
            process.exit(0);
        } catch (error) {
            Logger.error('Error during shutdown:', error);
            process.exit(1);
        }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap();
