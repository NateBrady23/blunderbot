import { ColumnOptions, getMetadataArgsStorage } from 'typeorm';
import { ColumnMetadataArgs } from 'typeorm/metadata-args/ColumnMetadataArgs';

/**
 * Timestamp column decorator
 * @param options
 * @returns Column meta data for a zoned timestamp
 */
export function TimestampColumn(opts?: ColumnOptions): PropertyDecorator {
  return function (target: object, propertyName: string | symbol) {
    getMetadataArgsStorage().columns.push({
      target: target.constructor,
      propertyName: propertyName.toString(),
      options: {
        type: 'timestamptz',
        nullable: true,
        default: (): string => 'LOCALTIMESTAMP',
        transformer: {
          to: (value) =>
            (typeof value !== 'string'
              ? (<Date>value).toISOString()
              : value
            ).replace('Z', ''),
          from: (value) =>
            typeof value === 'string'
              ? new Date(value.indexOf('Z') !== -1 ? value : value + 'Z')
              : value
        },
        ...opts
      }
    } as ColumnMetadataArgs);
  };
}
