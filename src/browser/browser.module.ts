import { forwardRef, Module } from '@nestjs/common';
import { BrowserService } from './browser.service';
import { ConfigV2Module } from '../configV2/configV2.module';

@Module({
  imports: [forwardRef(() => ConfigV2Module)],
  controllers: [],
  providers: [BrowserService],
  exports: [BrowserService]
})
export class BrowserModule {}
