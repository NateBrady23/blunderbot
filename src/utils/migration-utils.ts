import { TableIndex } from 'typeorm';

type ColumnOptions = {
  isUnique: boolean;
  column: string;
};

export async function createIndexes(
  queryRunner: {
    createIndex: (table: string, index: TableIndex) => Promise<void>;
    dropIndex: (table: string, indexName: string) => Promise<void>;
  },
  table: string,
  indexedColumns: ColumnOptions[]
) {
  for (const columnOptions of indexedColumns) {
    const indexName = `IDX_${table.toUpperCase()}_${columnOptions.column.toUpperCase()}`;
    try {
      // Because sometimes dropping the database doesn't drop the indexes
      await queryRunner.dropIndex(table, indexName);
    } catch (e) {
      // pass because index doesn't exist
    }
    await queryRunner.createIndex(
      table,
      new TableIndex({
        name: indexName,
        columnNames: [columnOptions.column],
        isUnique: columnOptions.isUnique
      })
    );
  }
}

export async function dropIndexes(
  queryRunner: {
    dropIndex: (table: string, indexName: string) => Promise<void>;
  },
  table: string,
  indexedColumns: ColumnOptions[]
) {
  for (const columnOptions of indexedColumns) {
    const indexName = `IDX_${table.toUpperCase()}_${columnOptions.column.toUpperCase()}`;
    await queryRunner.dropIndex(table, indexName);
  }
}
