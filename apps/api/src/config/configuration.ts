export interface DatabaseConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    url?: string;
    logging: boolean;
    pool: {
        max: number;
        min: number;
        idleTimeoutMillis: number;
        connectionTimeoutMillis: number;
    };
}

export interface AppConfig {
    nodeEnv: 'development' | 'production' | 'test';
    port: number;
}

export interface LoggingConfig {
    level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
}

export interface MigrationConfig {
    autoMigrate: boolean;
}

export interface SeedConfig {
    seedDatabase: boolean;
}

export interface SecurityConfig {
    corsOrigin: string;
    bodyLimit: string;
}

export interface ThrottleConfig {
    ttl: number;
    limit: number;
}

export interface OtelConfig {
    serviceName: string;
    exporterType: 'console' | 'otlp';
    exporterEndpoint?: string;
}

export interface SentryConfig {
    enabled: boolean;
    dsn: string;
    environment: string;
    tracesSampleRate: number;
    profilesSampleRate: number;
}

export interface DatadogConfig {
    enabled: boolean;
    serviceName: string;
    env: string;
    version: string;
    agentHost: string;
    agentPort: number;
    runtimeMetricsEnabled: boolean;
    profilingEnabled: boolean;
}

export interface PrometheusConfig {
    enabled: boolean;
    path: string;
    defaultMetrics: boolean;
}

export interface CacheConfig {
    enabled: boolean;
    type: 'memory' | 'redis';
    redis: {
        host: string;
        port: number;
        password?: string;
        db: number;
        ttl: number;
    };
}

export interface AuthConfig {
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtRefreshExpiresIn: string;
    google: {
        clientId: string;
        clientSecret: string;
        callbackUrl: string;
    };
    github: {
        clientId: string;
        clientSecret: string;
        callbackUrl: string;
    };
}

export interface Configuration {
    app: AppConfig;
    database: DatabaseConfig;
    logging: LoggingConfig;
    migration: MigrationConfig;
    seed: SeedConfig;
    security: SecurityConfig;
    throttle: ThrottleConfig;
    otel: OtelConfig;
    sentry: SentryConfig;
    datadog: DatadogConfig;
    prometheus: PrometheusConfig;
    cache: CacheConfig;
    auth: AuthConfig;
}

export default (): Configuration => ({
    app: {
        nodeEnv: (process.env.NODE_ENV as AppConfig['nodeEnv']) || 'development',
        port: parseInt(process.env.PORT || '8000', 10),
    },
    database: {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USER || 'test',
        password: process.env.DATABASE_PASSWORD || 'test',
        database: process.env.DATABASE_NAME || 'test',
        url: process.env.DATABASE_URL,
        logging: process.env.DATABASE_LOGGING === 'true',
        pool: {
            max: parseInt(process.env.DATABASE_POOL_MAX || '20', 10),
            min: parseInt(process.env.DATABASE_POOL_MIN || '5', 10),
            idleTimeoutMillis: parseInt(process.env.DATABASE_POOL_IDLE_TIMEOUT || '30000', 10),
            connectionTimeoutMillis: parseInt(
                process.env.DATABASE_POOL_CONNECTION_TIMEOUT || '2000',
                10,
            ),
        },
    },
    logging: {
        level:
            (process.env.LOG_LEVEL as LoggingConfig['level']) ||
            (process.env.NODE_ENV === 'production' ? 'warn' : 'info'),
    },
    migration: {
        autoMigrate: process.env.AUTO_MIGRATE !== 'false',
    },
    seed: {
        seedDatabase: process.env.SEED_DATABASE === 'true',
    },
    security: {
        corsOrigin: process.env.CORS_ORIGIN || '*',
        bodyLimit: process.env.BODY_SIZE_LIMIT || '1mb',
    },
    throttle: {
        ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    },
    otel: {
        serviceName: process.env.OTEL_SERVICE_NAME || 'scaffold-service',
        exporterType: (process.env.OTEL_EXPORTER_TYPE as OtelConfig['exporterType']) || 'console',
        exporterEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    },
    sentry: {
        enabled: process.env.SENTRY_ENABLED === 'true',
        dsn: process.env.SENTRY_DSN || '',
        environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '1.0'),
        profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '1.0'),
    },
    datadog: {
        enabled: process.env.DATADOG_ENABLED === 'true',
        serviceName: process.env.DATADOG_SERVICE_NAME || 'scaffold-service',
        env: process.env.DATADOG_ENV || process.env.NODE_ENV || 'development',
        version: process.env.DATADOG_VERSION || '1.0.0',
        agentHost: process.env.DATADOG_AGENT_HOST || 'localhost',
        agentPort: parseInt(process.env.DATADOG_AGENT_PORT || '8126', 10),
        runtimeMetricsEnabled: process.env.DATADOG_RUNTIME_METRICS_ENABLED !== 'false',
        profilingEnabled: process.env.DATADOG_PROFILING_ENABLED === 'true',
    },
    prometheus: {
        enabled: process.env.PROMETHEUS_ENABLED === 'true',
        path: process.env.PROMETHEUS_PATH || '/metrics',
        defaultMetrics: process.env.PROMETHEUS_DEFAULT_METRICS !== 'false',
    },
    cache: {
        enabled: process.env.CACHE_ENABLED === 'true',
        type: (process.env.CACHE_TYPE as CacheConfig['type']) || 'memory',
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB || '0', 10),
            ttl: parseInt(process.env.CACHE_TTL || '300', 10),
        },
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
        jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackUrl:
                process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8000/auth/google/callback',
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
            callbackUrl:
                process.env.GITHUB_CALLBACK_URL || 'http://localhost:8000/auth/github/callback',
        },
    },
});
