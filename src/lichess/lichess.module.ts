import { forwardRef, Module } from '@nestjs/common';
import { LichessService } from './lichess.service';
import { ConfigV2Module } from '../configV2/configV2.module';

@Module({
  imports: [forwardRef(() => ConfigV2Module)],
  controllers: [],
  providers: [LichessService],
  exports: [LichessService]
})
export class LichessModule {}
