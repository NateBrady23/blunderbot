import { FunctionQueue } from '../../utils/FunctionQueue';
import { Platform } from '../../enums';

const queue = new FunctionQueue();

const command: Command = {
  name: 'onsubs',
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState, services }) => {
    return queue.enqueue(async function () {
      const body = JSON.parse(ctx.body);
      if (services.configV2Service.get().twitch.onSubscribe.length) {
        for (const command of services.configV2Service.get().twitch
          .onSubscribe) {
          void services.twitchService.ownerRunCommand(command);
        }
      }
      if (body?.username) {
        commandState.contributions.subs[body.username] = true;
      }
      return true;
    });
  }
};

export default command;
