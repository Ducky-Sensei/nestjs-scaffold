import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import type { IEnvironment } from './i.environment';

// This file can be replaced during build by using webpack plugin.
// `nest build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `webpack.config.js`.

function swaggerInitializer(app: INestApplication): OpenAPIObject {
    const config = new DocumentBuilder()
        .setTitle('NestJS Web API')
        .setDescription('An example of NestJS')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api', app, document);

    return document;
}

export const environment: IEnvironment = {
    production: false,
    dbHost: process.env.DATABASE_HOST || 'localhost',
    dbPort: parseInt(process.env.DATABASE_PORT || '5432', 10),
    dbName: process.env.DATABASE_NAME || 'scaffold_db',
    dbUsername: process.env.DATABASE_USER || 'postgres',
    dbPassword: process.env.DATABASE_PASSWORD || 'postgres',
    logging: process.env.DATABASE_LOGGING === 'true' || true,
    autoMigrate: process.env.AUTO_MIGRATE !== 'false', // Enabled by default in development
    swaggerInitializer,
};
