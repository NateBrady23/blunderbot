import { Module } from '@nestjs/common';
import { ConfigV2Service } from './configV2.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ConfigV2Service],
  exports: [ConfigV2Service]
})
export class ConfigV2Module {}
