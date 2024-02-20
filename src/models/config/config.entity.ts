import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ConfigInterface } from './config.types';

@Entity()
export class Config extends BaseEntity implements ConfigInterface {
  @Column({
    type: 'json'
  })
  twitch: JSON;

  @Column({
    type: 'json'
  })
  lichess: JSON;

  @Column({
    type: 'json'
  })
  commandConfig: JSON;

  @Column({
    type: 'json'
  })
  discord: JSON;

  @Column({
    type: 'json'
  })
  openai: JSON;

  @Column({
    type: 'json'
  })
  spotify: JSON;

  @Column({
    type: 'json'
  })
  twitter: JSON;

  @Column({
    type: 'json'
  })
  trivia: JSON;

  @Column({
    type: 'json'
  })
  youtube: JSON;

  @Column({
    type: 'json'
  })
  misc: JSON;
}
