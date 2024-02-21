import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoredCommand } from './stored-command.entity';
import { StoredCommandCreateInput } from './stored-command.types';

@Injectable()
export class StoredCommandEntityService {
  constructor(
    @InjectRepository(StoredCommand)
    private StoredCommandRepository: Repository<StoredCommand>
  ) {}

  async create(input: StoredCommandCreateInput): Promise<StoredCommand> {
    const StoredCommand: StoredCommand =
      this.StoredCommandRepository.create(input);
    await this.StoredCommandRepository.save(StoredCommand);
    return StoredCommand;
  }

  async findAll(): Promise<StoredCommand[]> {
    return this.StoredCommandRepository.find();
  }

  async findById(id: string, failIfNotFound?: boolean): Promise<StoredCommand> {
    return this.find(
      {
        where: { id }
      },
      failIfNotFound
    );
  }

  async findByName(
    name: string,
    failIfNotFound?: boolean
  ): Promise<StoredCommand> {
    return this.find(
      {
        where: { name }
      },
      failIfNotFound
    );
  }

  async save(StoredCommand: StoredCommand): Promise<StoredCommand> {
    return this.StoredCommandRepository.save(StoredCommand);
  }

  async remove(StoredCommand: StoredCommand): Promise<void> {
    await this.StoredCommandRepository.remove(StoredCommand);
  }

  async softDelete(StoredCommand: StoredCommand): Promise<void> {
    StoredCommand.deletedAt = new Date();
    await this.StoredCommandRepository.save(StoredCommand);
  }

  private async find(
    options: any,
    failIfNotFound: any
  ): Promise<StoredCommand> {
    if (failIfNotFound) {
      return this.StoredCommandRepository.findOneOrFail(options);
    }
    return this.StoredCommandRepository.findOne(options);
  }
}
