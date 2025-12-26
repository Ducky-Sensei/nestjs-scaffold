import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface Containers {
    postgres: StartedPostgreSqlContainer;
}

async function cleanupStaleContainers(): Promise<void> {
    try {
        const { stdout } = await execAsync(
            "docker ps -a --filter publish=1530 --format '{{.ID}}' 2>/dev/null || true",
        );

        const containerIds = stdout
            .trim()
            .split('\n')
            .filter((id) => id);

        if (containerIds.length > 0) {
            console.log(`🧹 Cleaning up ${containerIds.length} stale container(s)...`);
            await execAsync(`docker rm -f ${containerIds.join(' ')} 2>/dev/null || true`);
            // Wait for port release
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    } catch (_error) {
        // Silently ignore - no containers to clean or docker not running
    }
}

export async function setupTestContainers(): Promise<Containers> {
    // Clean up stale containers before starting fresh
    await cleanupStaleContainers();

    setTimeout(() => {}, 1500);
    const postgres = await new PostgreSqlContainer('postgres:17.5-alpine3.22')
        .withExposedPorts({
            container: 5432,
            host: 1530,
        })
        .withUsername('test')
        .withPassword('test')
        .withDatabase('test')
        .start();

    return {
        postgres,
    };
}

export async function stopTestContainers(containers: Containers): Promise<void> {
    await containers.postgres.stop();
}
