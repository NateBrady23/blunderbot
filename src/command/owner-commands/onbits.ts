import { FunctionQueue } from '../../utils/FunctionQueue';
import { Platform } from '../../enums';

const queue = new FunctionQueue();

const command: Command = {
  name: 'onbits',
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    return queue.enqueue(async function () {
      let body: any = ctx.body;
      // To test bits like: !onbits 420
      if (body.match(/^\d{1,4}$/g)) {
        body = '{ "bits": ' + body + ' }';
      }
      body = JSON.parse(body);

      const user = body.user;
      const bits = parseInt(body.bits) || 0;
      let message = body.message;

      // If there's a user, add them to the contributions to thank them at the end of the stream
      if (user) {
        commandState.contributions.bits[user] =
          bits + (commandState.contributions.bits[user] || 0);
      }

      let commands: string[];
      if (
        services.configV2Service.get().twitch?.bits?.matches &&
        services.configV2Service.get().twitch?.bits?.matches[bits]
      ) {
        commands =
          services.configV2Service.get().twitch.bits.matches[bits].commands;
      } else {
        for (const match in services.configV2Service.get().twitch?.bits
          ?.matches) {
          if (match.startsWith('over')) {
            if (bits > parseInt(match.replace('over', ''))) {
              commands =
                services.configV2Service.get().twitch.bits.matches[match]
                  .commands;
              break;
            }
          }
          if (match.startsWith('under')) {
            if (bits < parseInt(match.replace('under', ''))) {
              commands =
                services.configV2Service.get().twitch.bits.matches[match]
                  .commands;
              break;
            }
          }
        }
      }
      if (commands) {
        for (const cmd of commands) {
          void services.twitchService.ownerRunCommand(cmd);
        }
      }

      // Play a message after all the other alerts and sounds play
      if (message && bits >= 100) {
        message = message.replace(/[a-z]\d{1,10}/gi, '').trim();
        message &&
          (await services.twitchService.ownerRunCommand(`!tts ${message}`));
      }
      return true;
    });
  }
};

export default command;
