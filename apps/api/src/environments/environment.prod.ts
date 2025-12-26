import type { OpenAPIObject } from '@nestjs/swagger';
import type { IEnvironment } from './i.environment';

// Production environment - requires all DB env vars to be set
if (
    !process.env.DB_HOST ||
    !process.env.DB_PORT ||
    !process.env.DB_NAME ||
    !process.env.DB_USER ||
    !process.env.DB_PASSWORD
) {
    throw new Error('Missing required database environment variables in production');
}

export const environment: IEnvironment = {
    production: true,
    dbHost: process.env.DB_HOST,
    dbPort: +process.env.DB_PORT,
    dbName: process.env.DB_NAME,
    dbUsername: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    logging: process.env.DATABASE_LOGGING === 'true',
    autoMigrate: false, // Always disabled in production
    swaggerInitializer: () => ({}) as OpenAPIObject,
};
