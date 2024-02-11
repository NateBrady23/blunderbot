import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { createIndexes } from '../utils/migration-utils';

const table = 'stored_command';
const indexedColumns = [
  {
    column: 'id',
    isUnique: true
  }
];

export class Config1707404925601 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: table,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isUnique: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'version',
            type: 'int',
            default: 1
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
            default: 'null'
          },
          {
            name: 'meta',
            type: 'json',
            isNullable: true
          },
          {
            name: 'twitch',
            type: 'json',
            isNullable: true
          },
          {
            name: 'lichess',
            type: 'json',
            isNullable: true
          },
          {
            name: 'discord',
            type: 'json',
            isNullable: true
          },
          {
            name: 'openai',
            type: 'json',
            isNullable: true
          },
          {
            name: 'spotify',
            type: 'json',
            isNullable: true
          },
          {
            name: 'twitter',
            type: 'json',
            isNullable: true
          },
          {
            name: 'trivia',
            type: 'json',
            isNullable: true
          },
          {
            name: 'misc',
            type: 'json',
            isNullable: true
          }
        ]
      }),
      true
    );

    await createIndexes(queryRunner, table, indexedColumns);
  }

  public async down(): Promise<void> {}
}
