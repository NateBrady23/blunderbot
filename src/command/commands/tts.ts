import { Platform } from '../../enums';
import { FunctionQueue } from '../../utils/FunctionQueue';

const queue = new FunctionQueue();

const command: Command = {
  name: 'tts',
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    return queue.enqueue(async function () {
      if (!ctx.body) return;
      await services.openaiService.tts(ctx.body, commandState.blunderbotVoice);
      return true;
    });
  }
};

export default command;
