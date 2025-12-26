import { plainToInstance } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    Matches,
    Max,
    Min,
    ValidateIf,
    validateSync,
} from 'class-validator';

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

enum LogLevel {
    Fatal = 'fatal',
    Error = 'error',
    Warn = 'warn',
    Info = 'info',
    Debug = 'debug',
    Trace = 'trace',
}

enum OtelExporterType {
    Console = 'console',
    Otlp = 'otlp',
}

class EnvironmentVariables {
    // Application Configuration
    @IsEnum(Environment)
    @IsNotEmpty()
    NODE_ENV: Environment = Environment.Development;

    @IsInt()
    @Min(1)
    @Max(65535)
    PORT: number = 8000;

    // Database Configuration
    @IsString()
    @IsNotEmpty()
    DATABASE_HOST: string;

    @IsInt()
    @Min(1)
    @Max(65535)
    DATABASE_PORT: number = 5432;

    @IsString()
    @IsNotEmpty()
    DATABASE_USER: string;

    @IsString()
    @IsNotEmpty()
    DATABASE_PASSWORD: string;

    @IsString()
    @IsNotEmpty()
    DATABASE_NAME: string;

    @IsOptional()
    @IsString()
    DATABASE_URL?: string;

    @IsOptional()
    @IsBoolean()
    DATABASE_LOGGING: boolean = false;

    // Database Connection Pool Configuration
    @IsInt()
    @Min(1)
    @Max(100)
    DATABASE_POOL_MAX: number = 20;

    @IsInt()
    @Min(0)
    @Max(50)
    DATABASE_POOL_MIN: number = 5;

    @IsInt()
    @Min(1000) // Minimum 1 second
    @Max(300000) // Maximum 5 minutes
    DATABASE_POOL_IDLE_TIMEOUT: number = 30000;

    @IsInt()
    @Min(500) // Minimum 500ms
    @Max(30000) // Maximum 30 seconds
    DATABASE_POOL_CONNECTION_TIMEOUT: number = 2000;

    // Logging Configuration
    @IsEnum(LogLevel)
    LOG_LEVEL: LogLevel = LogLevel.Info;

    // Migration Configuration
    @IsOptional()
    @IsBoolean()
    AUTO_MIGRATE: boolean = true;

    // Seed Configuration
    @IsOptional()
    @IsBoolean()
    SEED_DATABASE: boolean = false;

    // Security Configuration
    @IsString()
    @IsNotEmpty()
    CORS_ORIGIN: string = '*';

    @IsString()
    @IsNotEmpty()
    @Matches(/^\d+(\.\d+)?(b|kb|mb|gb)$/i, {
        message:
            'BODY_SIZE_LIMIT must be a valid size string (e.g., "1mb", "500kb", "10mb", "1gb")',
    })
    BODY_SIZE_LIMIT: string = '1mb';

    // Rate Limiting Configuration
    @IsInt()
    @Min(1000)
    @Max(3600000) // Max 1 hour
    THROTTLE_TTL: number = 60000;

    @IsInt()
    @Min(1)
    @Max(10000)
    THROTTLE_LIMIT: number = 100;

    // OpenTelemetry Configuration
    @IsString()
    @IsNotEmpty()
    OTEL_SERVICE_NAME: string = 'scaffold-service';

    @IsEnum(OtelExporterType)
    OTEL_EXPORTER_TYPE: OtelExporterType = OtelExporterType.Console;

    @IsOptional()
    @IsUrl({ require_tld: false })
    OTEL_EXPORTER_OTLP_ENDPOINT?: string;

    // Sentry Configuration
    @IsOptional()
    @IsBoolean()
    SENTRY_ENABLED: boolean = false;

    @ValidateIf((o) => o.NODE_ENV === Environment.Production && o.SENTRY_ENABLED === true)
    @IsString()
    @IsNotEmpty()
    SENTRY_DSN?: string;

    @IsOptional()
    @IsString()
    SENTRY_ENVIRONMENT?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    SENTRY_TRACES_SAMPLE_RATE: number = 1.0;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    SENTRY_PROFILES_SAMPLE_RATE: number = 1.0;

    // Datadog Configuration
    @IsOptional()
    @IsBoolean()
    DATADOG_ENABLED: boolean = false;

    @IsOptional()
    @IsString()
    DATADOG_SERVICE_NAME?: string;

    @IsOptional()
    @IsString()
    DATADOG_ENV?: string;

    @IsOptional()
    @IsString()
    DATADOG_VERSION?: string;

    @IsOptional()
    @IsString()
    DATADOG_AGENT_HOST?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(65535)
    DATADOG_AGENT_PORT: number = 8126;

    @IsOptional()
    @IsBoolean()
    DATADOG_RUNTIME_METRICS_ENABLED: boolean = true;

    @IsOptional()
    @IsBoolean()
    DATADOG_PROFILING_ENABLED: boolean = false;

    // Prometheus Configuration
    @IsOptional()
    @IsBoolean()
    PROMETHEUS_ENABLED: boolean = false;

    @IsOptional()
    @IsString()
    @Matches(/^\/[a-z0-9-_/]*$/i, {
        message: 'PROMETHEUS_PATH must be a valid URL path starting with /',
    })
    PROMETHEUS_PATH: string = '/metrics';

    @IsOptional()
    @IsBoolean()
    PROMETHEUS_DEFAULT_METRICS: boolean = true;

    // Cache Configuration
    @IsOptional()
    @IsBoolean()
    CACHE_ENABLED: boolean = false;

    @IsOptional()
    @IsEnum(['memory', 'redis'])
    CACHE_TYPE: 'memory' | 'redis' = 'memory';

    @ValidateIf((o) => o.CACHE_ENABLED === true && o.CACHE_TYPE === 'redis')
    @IsString()
    @IsNotEmpty()
    REDIS_HOST?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(65535)
    REDIS_PORT: number = 6379;

    @IsOptional()
    @IsString()
    REDIS_PASSWORD?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(15)
    REDIS_DB: number = 0;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(86400) // Max 24 hours in seconds
    CACHE_TTL: number = 300;

    // Authentication Configuration
    @IsString()
    @IsNotEmpty()
    @ValidateIf((o) => o.NODE_ENV === Environment.Production)
    JWT_SECRET?: string;

    @IsOptional()
    @IsString()
    JWT_EXPIRES_IN: string = '15m';

    @IsOptional()
    @IsString()
    JWT_REFRESH_EXPIRES_IN: string = '30d';

    // OAuth - Google Configuration
    @IsOptional()
    @IsString()
    GOOGLE_CLIENT_ID?: string;

    @IsOptional()
    @IsString()
    GOOGLE_CLIENT_SECRET?: string;

    @IsOptional()
    @IsUrl({ require_tld: false })
    GOOGLE_CALLBACK_URL?: string;

    // OAuth - GitHub Configuration
    @IsOptional()
    @IsString()
    GITHUB_CLIENT_ID?: string;

    @IsOptional()
    @IsString()
    GITHUB_CLIENT_SECRET?: string;

    @IsOptional()
    @IsUrl({ require_tld: false })
    GITHUB_CALLBACK_URL?: string;
}

export function validate(config: Record<string, unknown>) {
    // Transform string values to proper types
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
        whitelist: true,
        forbidNonWhitelisted: false, // Allow extra env vars that we don't validate
    });

    // Production-specific validations
    const productionErrors: string[] = [];

    if (validatedConfig.NODE_ENV === Environment.Production) {
        if (validatedConfig.CORS_ORIGIN === '*') {
            productionErrors.push(
                '  - CORS_ORIGIN: Cannot use wildcard (*) in production. Specify allowed origins explicitly.',
            );
        }

        const origins = validatedConfig.CORS_ORIGIN.split(',').map((o) => o.trim());
        for (const origin of origins) {
            // Skip if we already flagged wildcard
            if (origin === '*') continue;

            if (
                origin.includes('localhost') ||
                origin.includes('127.0.0.1') ||
                origin.includes('0.0.0.0')
            ) {
                productionErrors.push(
                    `  - CORS_ORIGIN: Cannot use localhost/127.0.0.1 origins in production (found: ${origin})`,
                );
            }

            // Require HTTPS for production origins (unless it's a mobile app schema)
            if (
                !origin.startsWith('https://') &&
                !origin.startsWith('capacitor://') &&
                !origin.startsWith('ionic://')
            ) {
                productionErrors.push(
                    `  - CORS_ORIGIN: Production origins must use HTTPS (found: ${origin})`,
                );
            }

            if (origin.startsWith('https://')) {
                try {
                    new URL(origin);
                } catch {
                    productionErrors.push(
                        `  - CORS_ORIGIN: Invalid origin URL format (found: ${origin})`,
                    );
                }
            }
        }

        // OAuth Production Validations
        if (validatedConfig.GOOGLE_CLIENT_ID && !validatedConfig.GOOGLE_CLIENT_SECRET) {
            productionErrors.push(
                '  - GOOGLE_CLIENT_SECRET: Required when GOOGLE_CLIENT_ID is set.',
            );
        }
        if (validatedConfig.GITHUB_CLIENT_ID && !validatedConfig.GITHUB_CLIENT_SECRET) {
            productionErrors.push(
                '  - GITHUB_CLIENT_SECRET: Required when GITHUB_CLIENT_ID is set.',
            );
        }

        // Callback URLs should be HTTPS in production
        if (
            validatedConfig.GOOGLE_CALLBACK_URL &&
            !validatedConfig.GOOGLE_CALLBACK_URL.startsWith('https://')
        ) {
            console.warn('\n!  WARNING: GOOGLE_CALLBACK_URL should use HTTPS in production.\n');
        }
        if (
            validatedConfig.GITHUB_CALLBACK_URL &&
            !validatedConfig.GITHUB_CALLBACK_URL.startsWith('https://')
        ) {
            console.warn('\n!  WARNING: GITHUB_CALLBACK_URL should use HTTPS in production.\n');
        }

        // Recommend enabling monitoring in production
        if (!validatedConfig.SENTRY_ENABLED && !validatedConfig.DATADOG_ENABLED) {
            console.warn(
                '\n!  WARNING: Neither Sentry nor Datadog is enabled in production.\n' +
                    '   Consider enabling at least one monitoring solution for production environments.\n',
            );
        }

        // If Sentry is enabled, DSN must be provided
        if (validatedConfig.SENTRY_ENABLED && !validatedConfig.SENTRY_DSN) {
            productionErrors.push(
                '  - SENTRY_DSN: Required when SENTRY_ENABLED is true in production.',
            );
        }

        // Warn about sample rates in production
        if (validatedConfig.SENTRY_ENABLED && validatedConfig.SENTRY_TRACES_SAMPLE_RATE === 1.0) {
            console.warn(
                '\n!  WARNING: SENTRY_TRACES_SAMPLE_RATE is set to 1.0 (100%) in production.\n' +
                    '   Consider using a lower value for high-traffic applications.\n',
            );
        }

        // Recommend OTLP exporter in production
        if (validatedConfig.OTEL_EXPORTER_TYPE === OtelExporterType.Console) {
            console.warn(
                '\n!  WARNING: OTEL_EXPORTER_TYPE is set to "console" in production.\n' +
                    '   Consider using "otlp" for production deployments.\n',
            );
        }
    }

    const allErrors = [
        ...errors.map((error) => {
            const constraints = error.constraints
                ? Object.values(error.constraints).join(', ')
                : 'Unknown validation error';
            return `  - ${error.property}: ${constraints}`;
        }),
        ...productionErrors,
    ];

    if (allErrors.length > 0) {
        throw new Error(`Configuration validation failed:\n${allErrors.join('\n')}`);
    }

    return validatedConfig;
}
