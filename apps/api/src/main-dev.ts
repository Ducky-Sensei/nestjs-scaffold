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
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import helmet from 'helmet';
import * as path from 'path';
import { setupTestContainers, stopTestContainers } from '../dev/test-containers';
import { seedDatabase } from '../dev/test-data/seed';
import { AppModule } from './app/app.module';
import { flushDatadog } from './config/datadog';
import { flushSentry } from './config/sentry';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { RequestIdMiddleware } from './middleware/request-id.middleware';

async function bootstrap(): Promise<void> {
    let containers: Awaited<ReturnType<typeof setupTestContainers>> | null = null;
    let isShuttingDown = false;

    const cleanup = async (reason: string) => {
        if (isShuttingDown) return;
        isShuttingDown = true;

        Logger.log(`\n🛑 ${reason}, stopping containers...`);
        if (containers) {
            try {
                await stopTestContainers(containers);
                Logger.log('✅ Containers stopped');
            } catch (error) {
                Logger.error('Error stopping containers:', error);
            }
        }
        process.exit(1);
    };

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
        Logger.error('Uncaught Exception:', error);
        cleanup('Uncaught exception detected');
    });

    process.on('unhandledRejection', (reason) => {
        Logger.error('Unhandled Rejection:', reason);
        cleanup('Unhandled rejection detected');
    });

    try {
        Logger.log('Starting test containers...');
        containers = await setupTestContainers();

        process.env.DATABASE_HOST = containers.postgres.getHost();
        process.env.DATABASE_PORT = containers.postgres.getPort().toString();
        process.env.DATABASE_USER = containers.postgres.getUsername();
        process.env.DATABASE_PASSWORD = containers.postgres.getPassword();
        process.env.DATABASE_NAME = containers.postgres.getDatabase();

        Logger.log(
            `✅ Database container started at ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`,
        );

        // Start the NestJS application
        Logger.log('Creating NestJS application...');
        const app = await NestFactory.create(AppModule);

        app.enableVersioning({
            type: VersioningType.URI,
            defaultVersion: '1',
        });

        app.use(
            helmet({
                contentSecurityPolicy: false,
            }),
        );

        app.use(RequestIdMiddleware);

        app.enableCors({
            origin: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
        });

        app.useGlobalFilters(new HttpExceptionFilter());

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        const config = new DocumentBuilder()
            .setTitle('NestJS Scaffold API')
            .setDescription('Production-ready NestJS API with TypeORM and PostgreSQL')
            .setVersion('1.0')
            .addServer('http://localhost:8000', 'Development server')
            .addTag('v1/products', 'Product management endpoints (v1)')
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api', app, document, {
            customSiteTitle: 'NestJS Scaffold API - v1',
        });

        Logger.log('📚 Swagger documentation available at http://localhost:8000/api');

        const restartFlagPath = path.join(__dirname, '../.nodemon-restart');
        const isRestart = fs.existsSync(restartFlagPath);

        Logger.log(
            `Seeding check: isRestart=${isRestart}, SEED_DATABASE=${process.env.SEED_DATABASE}`,
        );

        if (!isRestart && process.env.SEED_DATABASE === 'true') {
            Logger.log('Starting database seeding...');
            try {
                await seedDatabase(app);
                Logger.log('✅ Database seeding completed');
            } catch (error) {
                Logger.error('❌ Failed to seed database:', error);
                Logger.error('Stack:', error.stack);
                throw error;
            }
        }

        // Create restart flag for subsequent runs
        if (!isRestart) {
            fs.writeFileSync(restartFlagPath, '');
        }

        Logger.log('Starting server...');
        await app.listen(8000, '0.0.0.0');
        Logger.log('🚀 Server started on http://localhost:8000');

        // Handle graceful shutdown
        const shutdown = async (signal: string) => {
            if (isShuttingDown) return;
            isShuttingDown = true;

            Logger.log(`\n🛑 ${signal} received, stopping server and containers...`);
            try {
                if (containers) {
                    await stopTestContainers(containers);
                    Logger.log('✅ Containers stopped');
                }

                // Flush monitoring services before closing
                await Promise.allSettled([flushSentry(2000), flushDatadog()]);

                // Close the NestJS application
                await app.close();
                Logger.log('✅ Server closed');

                process.exit(0);
            } catch (error) {
                Logger.error('Error during shutdown:', error);
                process.exit(1);
            }
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    } catch (error) {
        Logger.error('Failed to start application:', error);
        Logger.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        if (error.stack) {
            Logger.error('Stack trace:', error.stack);
        }
        await cleanup('Application startup failed');
    }
}

bootstrap();
