export default async function globalTeardown() {
    console.log('\n🧹 Cleaning up test environment...\n');

    const dataSource = (global as any).__DATA_SOURCE__;
    const postgresContainer = (global as any).__POSTGRES_CONTAINER__;

    // Close DataSource connection
    if (dataSource?.isInitialized) {
        await dataSource.destroy();
        console.log('✅ Database connection closed');
    }

    // Stop the container
    if (postgresContainer) {
        await postgresContainer.stop();
        console.log('✅ PostgreSQL container stopped\n');
    }
}
