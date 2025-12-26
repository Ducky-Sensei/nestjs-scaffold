import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddOrganizations1735200000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'organizations',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'customerId',
                        type: 'varchar',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'theme',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            'organizations',
            new TableIndex({
                name: 'IDX_ORGANIZATION_CUSTOMER_ID',
                columnNames: ['customerId'],
            }),
        );

        await queryRunner.createTable(
            new Table({
                name: 'user_organizations',
                columns: [
                    {
                        name: 'userId',
                        type: 'uuid',
                        isPrimary: true,
                    },
                    {
                        name: 'organizationId',
                        type: 'uuid',
                        isPrimary: true,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'user_organizations',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'user_organizations',
            new TableForeignKey({
                columnNames: ['organizationId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'organizations',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createIndex(
            'user_organizations',
            new TableIndex({
                name: 'IDX_USER_ORGANIZATIONS_USER',
                columnNames: ['userId'],
            }),
        );

        await queryRunner.createIndex(
            'user_organizations',
            new TableIndex({
                name: 'IDX_USER_ORGANIZATIONS_ORG',
                columnNames: ['organizationId'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('user_organizations');
        await queryRunner.dropTable('organizations');
    }
}
