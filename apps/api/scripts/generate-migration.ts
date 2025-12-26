import { execSync } from 'child_process';

const migrationName = process.argv[2];

if (!migrationName) {
    console.error('Error: Migration name is required');
    console.log('Usage: pnpm migration:generate <migration-name>');
    console.log('Example: pnpm migration:generate InitialSchema');
    process.exit(1);
}

const command = `typeorm-ts-node-commonjs migration:generate src/migrations/${migrationName} -d src/config/typeorm.config.ts`;

try {
    execSync(command, { stdio: 'inherit' });
} catch (error) {
    process.exit(1);
}
