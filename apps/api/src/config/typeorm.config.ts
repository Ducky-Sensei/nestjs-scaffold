import { config } from 'dotenv';
import { join } from 'path';
import { DataSource, type DataSourceOptions } from 'typeorm';

config({ path: '.env.development' });
config({ path: '.env' });

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'scaffold_db',
    entities: [join(__dirname, '/../**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, '/../migrations/*{.ts,.js}')],
    migrationsRun: true,
    migrationsTableName: 'migrations',
    migrationsTransactionMode: 'all',
    synchronize: false,
    logging: process.env.DATABASE_LOGGING === 'true' || false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
