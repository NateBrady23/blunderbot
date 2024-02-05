import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StoredCommand } from './stored-command/stored-command.entity';
import { StoredCommandEntityService } from './stored-command/stored-command.service';

@Module({
  controllers: [],
  imports: [TypeOrmModule.forFeature([StoredCommand])],
  providers: [StoredCommandEntityService],
  exports: [StoredCommandEntityService]
})
export class EntityModule {}
