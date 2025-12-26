import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import { Product } from '../src/app/product/product.entity';

let postgresContainer: StartedPostgreSqlContainer;
let dataSource: DataSource;

export default async function globalSetup() {
    console.log('\n🐳 Starting PostgreSQL container...\n');

    // Start the PostgreSQL container
    postgresContainer = await new PostgreSqlContainer('postgres:16-alpine')
        .withExposedPorts(5432)
        .start();

    const connectionUri = postgresContainer.getConnectionUri();

    // Store connection info in global variables for tests to access
    (global as any).__POSTGRES_URI__ = connectionUri;
    (global as any).__POSTGRES_CONTAINER__ = postgresContainer;

    console.log(`✅ PostgreSQL container started at: ${connectionUri}\n`);

    // Initialize TypeORM DataSource and create tables
    dataSource = new DataSource({
        type: 'postgres',
        url: connectionUri,
        entities: [Product],
        synchronize: true, // Auto-create tables based on entities
        logging: false,
    });

    await dataSource.initialize();
    console.log('✅ Database schema created\n');

    // Store dataSource for teardown
    (global as any).__DATA_SOURCE__ = dataSource;
}
