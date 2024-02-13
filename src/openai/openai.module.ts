import { forwardRef, Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { CommandModule } from '../command/command.module';
import { OpenaiController } from './openai.controller';
import { ConfigV2Module } from '../configV2/configV2.module';

@Module({
  imports: [forwardRef(() => CommandModule), forwardRef(() => ConfigV2Module)],
  controllers: [OpenaiController],
  providers: [OpenaiService],
  exports: [OpenaiService]
})
export class OpenaiModule {}
