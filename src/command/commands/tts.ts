import { fixPronunciations } from 'src/utils/utils';
import { Platform } from '../../enums';
import { FunctionQueue } from '../../utils/FunctionQueue';
import { CONFIG } from '../../config/config.service';

const queue = new FunctionQueue();

const command: Command = {
  name: 'tts',
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    return queue.enqueue(async function () {
      if (!CONFIG.openai?.enabled) {
        console.log(`OpenAI is not enabled in !tts command.`);
        return false;
      }
      if (!ctx.body) return;
      let text = ctx.body;
      text = fixPronunciations(text);
      await services.openaiService.tts(text, commandState.blunderbotVoice);
      return true;
    });
  }
};

export default command;
