import { DataSource } from 'typeorm';
import { Product } from '../src/app/product/product.entity';

/**
 * Get the database connection URI from the global setup
 */
export function getConnectionUri(): string {
    const uri = (global as any).__POSTGRES_URI__;
    if (!uri) {
        throw new Error('Database connection URI not found. Make sure global setup has run.');
    }
    return uri;
}

/**
 * Create a new TypeORM DataSource for use in tests
 */
export async function createTestDataSource(): Promise<DataSource> {
    const dataSource = new DataSource({
        type: 'postgres',
        url: getConnectionUri(),
        entities: [Product],
        synchronize: false, // Tables already created in global setup
        logging: false,
    });

    await dataSource.initialize();
    return dataSource;
}

/**
 * Clean all data from database tables (useful in beforeEach)
 */
export async function cleanDatabase(dataSource: DataSource): Promise<void> {
    const entities = dataSource.entityMetadatas;

    for (const entity of entities) {
        const repository = dataSource.getRepository(entity.name);
        await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
    }
}
