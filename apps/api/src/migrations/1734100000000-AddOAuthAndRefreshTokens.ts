import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableColumn,
    TableForeignKey,
    TableIndex,
} from 'typeorm';

export class AddOAuthAndRefreshTokens1734100000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'users',
            'password',
            new TableColumn({
                name: 'password',
                type: 'varchar',
                isNullable: true,
            }),
        );

        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'authProvider',
                type: 'varchar',
                isNullable: true,
            }),
        );

        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'authProviderId',
                type: 'varchar',
                isNullable: true,
            }),
        );

        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'authProviderData',
                type: 'json',
                isNullable: true,
            }),
        );

        await queryRunner.createIndex(
            'users',
            new TableIndex({
                name: 'IDX_USER_AUTH_PROVIDER',
                columnNames: ['authProvider', 'authProviderId'],
            }),
        );

        await queryRunner.createTable(
            new Table({
                name: 'refresh_tokens',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'tokenHash',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'userId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'expiresAt',
                        type: 'timestamp',
                        isNullable: false,
                    },
                    {
                        name: 'isRevoked',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'userAgent',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'ipAddress',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            'refresh_tokens',
            new TableIndex({
                name: 'IDX_REFRESH_TOKEN_HASH',
                columnNames: ['tokenHash'],
            }),
        );

        await queryRunner.createIndex(
            'refresh_tokens',
            new TableIndex({
                name: 'IDX_REFRESH_TOKEN_USER',
                columnNames: ['userId'],
            }),
        );

        await queryRunner.createIndex(
            'refresh_tokens',
            new TableIndex({
                name: 'IDX_REFRESH_TOKEN_EXPIRES',
                columnNames: ['expiresAt'],
            }),
        );

        await queryRunner.createForeignKey(
            'refresh_tokens',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('refresh_tokens');

        await queryRunner.dropIndex('users', 'IDX_USER_AUTH_PROVIDER');

        await queryRunner.dropColumn('users', 'authProviderData');
        await queryRunner.dropColumn('users', 'authProviderId');
        await queryRunner.dropColumn('users', 'authProvider');

        await queryRunner.changeColumn(
            'users',
            'password',
            new TableColumn({
                name: 'password',
                type: 'varchar',
                isNullable: false,
            }),
        );
    }
}
