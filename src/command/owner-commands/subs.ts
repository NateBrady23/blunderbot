import { FunctionQueue } from '../../utils/FunctionQueue';
import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const queue = new FunctionQueue();

const command: Command = {
  name: 'subs',
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState, services }) => {
    return queue.enqueue(async function () {
      const body = JSON.parse(ctx.body);
      if (CONFIG.twitch.subCommands?.length) {
        for (const command of CONFIG.twitch.subCommands) {
          void services.twitchService.ownerRunCommand(command);
        }
      }
      if (body?.username) {
        commandState.contributions.subs[body.username] = true;
      }
    });
  }
};

export default command;
