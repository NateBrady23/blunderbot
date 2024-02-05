import { ColumnOptions, getMetadataArgsStorage } from 'typeorm';
import { ColumnMetadataArgs } from 'typeorm/metadata-args/ColumnMetadataArgs';
import { BaseEntity } from './base.entity';

/**
 * Timestamp column decorator
 * @param options
 * @returns Column meta data for a zoned timestamp
 */
export function TimestampColumn(options?: ColumnOptions): PropertyDecorator {
  return function (object: BaseEntity, propertyName: string) {
    getMetadataArgsStorage().columns.push({
      target: object.constructor,
      propertyName: propertyName,
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
        ...options
      }
    } as ColumnMetadataArgs);
  };
}
