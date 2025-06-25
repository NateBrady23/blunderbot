import { FunctionQueue } from '../../utils/FunctionQueue';
import { Platform } from '../../enums';

const queue = new FunctionQueue();

const command: Command = {
  name: 'onsubs',
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState, services }) => {
    return queue.enqueue(async function () {
      let body;
      try {
        body = JSON.parse(ctx.body || '');
      } catch {
        // If unparsed, assume it's !onsubs from the owner
      }
      if (services.configV2Service.get().twitch?.onSubscribe?.length) {
        for (const command of services.configV2Service.get().twitch
          ?.onSubscribe || []) {
          void services.twitchService.ownerRunCommand(command);
        }
      }
      if (body?.username) {
        commandState.contributions.subs[body.username] = true;
      }
      if (body?.message) {
        void services.twitchService.ownerRunCommand(`!tts ${body.message}`);
      }
      return true;
    });
  }
};

export default command;
