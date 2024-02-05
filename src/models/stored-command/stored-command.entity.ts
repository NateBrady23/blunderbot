import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { StoredCommandInterface } from './stored-command.types';

@Entity()
export class StoredCommand
  extends BaseEntity
  implements StoredCommandInterface
{
  //
  @Column({ length: 200 })
  name: string;

  @Column({ length: 200 })
  message: string;
}
