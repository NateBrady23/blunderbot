import { FunctionQueue } from '../../utils/FunctionQueue';
import { Platform } from '../../enums';
import { removeSymbols } from 'src/utils/utils';

const queue = new FunctionQueue();

const command: Command = {
  name: 'onbans',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    return queue.enqueue(async function () {
      let body;
      try {
        body = JSON.parse(ctx.body || '');
      } catch {
        // If unparsed, assume it's !onbans from the owner
      }
      if (services.configV2Service.get().twitch?.onBan?.length) {
        for (let command of services.configV2Service.get().twitch?.onBan ||
          []) {
          if (body?.username) {
            command = command.replace(
              /{username}/g,
              removeSymbols(body.username)
            );
          }
          void services.twitchService.ownerRunCommand(command);
        }
      }

      return true;
    });
  }
};

export default command;
