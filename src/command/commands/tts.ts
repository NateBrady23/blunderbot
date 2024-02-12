import { fixPronunciations } from 'src/utils/utils';
import { Platform } from '../../enums';
import { FunctionQueue } from '../../utils/FunctionQueue';
import { CONFIG } from '../../config/config.service';

const queue = new FunctionQueue();

const command: Command = {
  name: 'tts',
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    return queue.enqueue(async function (): Promise<boolean> {
      if (!CONFIG.get().openai?.enabled) {
        console.log(`OpenAI is not enabled in !tts command.`);
        return false;
      }
      if (!ctx.body) return false;
      let text = ctx.body;
      text = fixPronunciations(text);
      const res = await services.openaiService.tts(
        text,
        commandState.blunderbotVoice
      );
      if (!res) {
        ctx.reply(ctx, `I'm sorry, I couldn't generate audio for that text.`);
        return false;
      }
      return true;
    });
  }
};

export default command;
