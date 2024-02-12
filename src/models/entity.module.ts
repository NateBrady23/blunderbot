import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StoredCommand } from './stored-command/stored-command.entity';
import { StoredCommandEntityService } from './stored-command/stored-command.service';
import { ConfigEntityService } from './config/config.service';
import { Config } from './config/config.entity';

@Module({
  controllers: [],
  imports: [TypeOrmModule.forFeature([Config, StoredCommand])],
  providers: [ConfigEntityService, StoredCommandEntityService],
  exports: [ConfigEntityService, StoredCommandEntityService]
})
export class EntityModule {}
