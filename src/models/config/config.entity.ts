import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity()
export class Config extends BaseEntity implements ConfigInterface {
  @Column({
    type: 'json'
  })
  public twitch: JSON;

  @Column({
    type: 'json'
  })
  public lichess: JSON;

  @Column({
    type: 'json'
  })
  public commandConfig: JSON;

  @Column({
    type: 'json'
  })
  public discord: JSON;

  @Column({
    type: 'json'
  })
  public openai: JSON;

  @Column({
    type: 'json'
  })
  public spotify: JSON;

  @Column({
    type: 'json'
  })
  public bluesky: JSON;

  @Column({
    type: 'json'
  })
  public trivia: JSON;

  @Column({
    type: 'json'
  })
  public youtube: JSON;

  @Column({
    type: 'json'
  })
  public misc: JSON;
}
