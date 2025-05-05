import { Platform } from '../../enums';
import { FunctionQueue } from '../../utils/FunctionQueue';

const queue = new FunctionQueue();

const command: Command = {
  name: 'tts',
  aliases: ['say'],
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    return queue.enqueue(async function (): Promise<boolean> {
      if (
        !services.configV2Service.get().openai?.enabled ||
        !services.configV2Service.get().openai?.ttsModel
      ) {
        console.log(`OpenAI is not enabled in !tts command.`);
        return false;
      }
      if (!ctx.body) return false;
      let text = ctx.body;
      text = services.openaiService.fixPronunciations(text);
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
