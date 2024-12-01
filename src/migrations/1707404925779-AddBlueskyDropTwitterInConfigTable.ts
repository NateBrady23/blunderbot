import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const table = 'config';

export class AddBlueskyDropTwitterInConfigTable1707404925779
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      table,
      new TableColumn({
        name: 'bluesky',
        type: 'json',
        isNullable: true
      })
    );
    await queryRunner.dropColumn(
      table,
      new TableColumn({
        name: 'twitter',
        type: 'json',
        isNullable: true
      })
    );
  }

  public async down(): Promise<void> {}
}
