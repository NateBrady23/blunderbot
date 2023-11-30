import { forwardRef, Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { CommandModule } from '../command/command.module';
import { OpenaiController } from './openai.controller';

@Module({
  imports: [forwardRef(() => CommandModule)],
  controllers: [OpenaiController],
  providers: [OpenaiService],
  exports: [OpenaiService]
})
export class OpenaiModule {}
