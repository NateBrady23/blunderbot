import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { StoredCommand } from './stored-command.entity';

@Injectable()
export class StoredCommandEntityService {
  public constructor(
    @InjectRepository(StoredCommand)
    private readonly StoredCommandRepository: Repository<StoredCommand>
  ) {}

  public async create(input: StoredCommandInterface): Promise<StoredCommand> {
    const StoredCommand: StoredCommand =
      this.StoredCommandRepository.create(input);
    await this.StoredCommandRepository.save(StoredCommand);
    return StoredCommand;
  }

  public async findAll(): Promise<StoredCommand[]> {
    return this.StoredCommandRepository.find();
  }

  public async findById(
    id: string,
    failIfNotFound?: boolean
  ): Promise<StoredCommand | null> {
    return this.find(
      {
        where: { id: Number(id) }
      },
      failIfNotFound ?? false
    );
  }

  public async findByName(
    name: string,
    failIfNotFound?: boolean
  ): Promise<StoredCommand | null> {
    return this.find(
      {
        where: { name }
      },
      failIfNotFound ?? false
    );
  }

  public async save(StoredCommand: StoredCommand): Promise<StoredCommand> {
    return this.StoredCommandRepository.save(StoredCommand);
  }

  public async remove(StoredCommand: StoredCommand): Promise<void> {
    await this.StoredCommandRepository.remove(StoredCommand);
  }

  public async softDelete(StoredCommand: StoredCommand): Promise<void> {
    StoredCommand.deletedAt = new Date();
    await this.StoredCommandRepository.save(StoredCommand);
  }

  private async find(
    opts: FindOneOptions<StoredCommand>,
    failIfNotFound: boolean
  ): Promise<StoredCommand | null> {
    if (failIfNotFound) {
      return this.StoredCommandRepository.findOneOrFail(opts);
    }
    return this.StoredCommandRepository.findOne(opts) ?? null;
  }
}
