import { Body, Controller, Post } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Post('/translate')
  translate(@Body() body: TranslationRequest) {
    return this.openaiService.translate(body.message);
  }
}
