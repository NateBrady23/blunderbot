import { Module } from '@nestjs/common';
import { ConfigV2Service } from './configV2.service';
import { EntityModule } from '../models/entity.module';
import { ConfigV2Controller } from './configV2.controller';

@Module({
  imports: [EntityModule],
  controllers: [ConfigV2Controller],
  providers: [ConfigV2Service],
  exports: [ConfigV2Service]
})
export class ConfigV2Module {}
