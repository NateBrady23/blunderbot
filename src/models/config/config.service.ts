/**
 * No save option. All config updates will create a new record, allowing for easy rollback
 * and audit history in an admin interface.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionFor } from 'nest-transact';
import { ModuleRef } from '@nestjs/core';
import { Config } from './config.entity';
import { ConfigCreateInput } from './config.types';

@Injectable()
export class ConfigEntityService extends TransactionFor<ConfigEntityService> {
  constructor(
    @InjectRepository(Config)
    private ConfigRepository: Repository<Config>,
    moduleRef: ModuleRef
  ) {
    super(moduleRef);
  }

  async create(input: ConfigCreateInput): Promise<Config> {
    const Config: Config = this.ConfigRepository.create(input);
    await this.ConfigRepository.insert(Config);
    return Config;
  }

  async latest(): Promise<Config> {
    return this.ConfigRepository.findOne({ where: {}, order: { id: 'DESC' } });
  }

  async save(Config: Config): Promise<Config> {
    return this.ConfigRepository.save(Config);
  }

  async remove(Config: Config): Promise<void> {
    await this.ConfigRepository.remove(Config);
  }

  async softDelete(Config: Config): Promise<void> {
    Config.deletedAt = new Date();
    await this.ConfigRepository.save(Config);
  }

  async findById(id: string, failIfNotFound?: boolean): Promise<Config> {
    return this.find(
      {
        where: { id }
      },
      failIfNotFound
    );
  }

  private async find(options: any, failIfNotFound: any): Promise<Config> {
    if (failIfNotFound) {
      return this.ConfigRepository.findOneOrFail(options);
    }
    return this.ConfigRepository.findOne(options);
  }
}
