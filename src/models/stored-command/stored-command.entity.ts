import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity()
export class StoredCommand
  extends BaseEntity
  implements StoredCommandInterface
{
  //
  @Column({ length: 200 })
  public name: string;

  @Column({ length: 200 })
  public message: string;
}
