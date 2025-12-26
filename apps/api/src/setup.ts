import type { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

export async function teardownApp(app: INestApplication): Promise<void> {
    const dataSource = app.get(DataSource);

    if (dataSource?.isInitialized) {
        await dataSource.destroy();
    }

    await app.close();
}
