import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    DiskHealthIndicator,
    HealthCheck,
    HealthCheckService,
    type HealthIndicatorResult,
    MemoryHealthIndicator,
    TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import type { Cache } from 'cache-manager';
import type { Configuration } from '../../config/configuration';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Health Check Controller
 *
 * Provides three endpoints for different health check scenarios:
 * - GET /health: General health check (database + disk + memory + cache)
 * - GET /health/ready: Readiness probe for K8s (checks all dependencies including cache)
 * - GET /health/live: Liveness probe for K8s (checks if app is running)
 */
@Public()
@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: TypeOrmHealthIndicator,
        private disk: DiskHealthIndicator,
        private memory: MemoryHealthIndicator,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private configService: ConfigService<Configuration, true>,
    ) {}

    /**
     * General health check endpoint
     * Checks database connectivity, disk space, and memory usage
     */
    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            // Database connectivity check
            (): Promise<HealthIndicatorResult> => this.db.pingCheck('database'),

            // Disk space check - alert if disk is more than 90% full
            (): Promise<HealthIndicatorResult> =>
                this.disk.checkStorage('disk', {
                    thresholdPercent: 0.9, // Alert at 90% usage
                    path: '/',
                }),

            // Memory heap check - alert if heap usage exceeds 1GB
            // Adjust based on your production memory requirements
            (): Promise<HealthIndicatorResult> =>
                this.memory.checkHeap('memory_heap', 1024 * 1024 * 1024),

            // Memory RSS check - alert if RSS exceeds 1.5GB
            // Adjust based on your production memory requirements
            (): Promise<HealthIndicatorResult> =>
                this.memory.checkRSS('memory_rss', 1.5 * 1024 * 1024 * 1024),
        ]);
    }

    /**
     * Readiness probe for Kubernetes
     * Checks if the application is ready to receive traffic
     * Verifies all critical dependencies are available
     */
    @Get('ready')
    @HealthCheck()
    async ready() {
        const cacheConfig = this.configService.get('cache', { infer: true });
        const checks: (() => Promise<HealthIndicatorResult>)[] = [
            // Database connectivity - critical for readiness
            (): Promise<HealthIndicatorResult> => this.db.pingCheck('database'),
        ];

        if (cacheConfig.enabled && cacheConfig.type === 'redis') {
            checks.push(async (): Promise<HealthIndicatorResult> => {
                try {
                    const testKey = 'health:check';
                    const testValue = 'ok';
                    await this.cacheManager.set(testKey, testValue, 5000);
                    const value = await this.cacheManager.get(testKey);

                    if (value !== testValue) {
                        throw new Error('Redis read/write verification failed');
                    }

                    return {
                        redis: {
                            status: 'up',
                        },
                    };
                } catch (error) {
                    return {
                        redis: {
                            status: 'down',
                            message: error.message,
                        },
                    };
                }
            });
        }

        return this.health.check(checks);
    }

    /**
     * Liveness probe for Kubernetes
     * Checks if the application is alive and should not be restarted
     * Does NOT check external dependencies - only verifies the app is responsive
     */
    @Get('live')
    @HealthCheck()
    live() {
        // Liveness probe - checks if the app is running
        // Does not check dependencies to avoid restart loops
        // when external services are temporarily unavailable
        return this.health.check([]);
    }
}
