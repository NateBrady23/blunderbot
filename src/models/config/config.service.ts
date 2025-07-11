/**
 * No save option. All config updates will create a new record, allowing for easy rollback
 * and audit history in an admin interface.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Config } from './config.entity';

@Injectable()
export class ConfigEntityService {
  public constructor(
    @InjectRepository(Config)
    private readonly ConfigRepository: Repository<Config>
  ) {}

  public async create(input: ConfigCreateInput): Promise<Config> {
    const Config: Config = this.ConfigRepository.create(input);
    await this.ConfigRepository.insert(Config);
    return Config;
  }

  public async latest(): Promise<Config | null> {
    return this.ConfigRepository.findOne({
      where: {},
      order: { id: 'DESC' }
    });
  }

  public async save(Config: Config): Promise<Config> {
    return this.ConfigRepository.save(Config);
  }

  public async remove(Config: Config): Promise<void> {
    await this.ConfigRepository.remove(Config);
  }

  public async softDelete(Config: Config): Promise<void> {
    Config.deletedAt = new Date();
    await this.ConfigRepository.save(Config);
  }

  public async findById(
    id: string,
    failIfNotFound = false
  ): Promise<Config | null> {
    return this.find(
      {
        where: { id: Number(id) }
      },
      failIfNotFound
    );
  }

  private async find(
    opts: FindOneOptions<Config>,
    failIfNotFound: boolean
  ): Promise<Config | null> {
    if (failIfNotFound) {
      return this.ConfigRepository.findOneOrFail(opts);
    }
    return this.ConfigRepository.findOne(opts);
  }
}
