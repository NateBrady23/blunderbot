import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const table = 'config';

export class AddColumnsToConfigTable1707404925669
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      table,
      new TableColumn({
        name: 'youtube',
        type: 'json',
        isNullable: true
      })
    );
    await queryRunner.addColumn(
      table,
      new TableColumn({
        name: 'command_config',
        type: 'json',
        isNullable: true
      })
    );
  }

  public async down(): Promise<void> {}
}
