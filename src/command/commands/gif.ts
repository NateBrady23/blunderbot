import { FunctionQueue } from '../../utils/FunctionQueue';
import { sleep } from '../../utils/utils';
import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const queue = new FunctionQueue();

const command: Command = {
  name: 'gif',
  help: `Displays a gif based on the message on the chessboard. (non-subscribers can use the channel redemption for 1k BlunderBucks to do the same)`,
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    if (CONFIG.get().giphy?.enabled === false) {
      ctx.botSpeak('Giphy is disabled in !gif.');
      return false;
    }
    return queue.enqueue(async function () {
      try {
        let milliseconds = 7000;
        let msg = ctx.body;
        if (ctx.args[0].startsWith('!s')) {
          msg = ctx.body.replace(ctx.args[0], '').trim();
          milliseconds = parseInt(ctx.args[0].replace('!s', '')) * 1000;
        }
        if (ctx.platform === Platform.Twitch) {
          const giphyUrl = await services.giphyService.fetchGif(msg);
          services.twitchGateway.sendDataToSockets('serverMessage', {
            type: 'GIPHY',
            user: ctx.displayName,
            giphyUrl,
            milliseconds
          });
          await sleep(milliseconds + 1000);
        } else {
          const giphyUrl = await services.giphyService.fetchGif(msg);
          ctx.botSpeak(giphyUrl);
        }
        return true;
      } catch (e) {
        console.error(e);
      }
    });
  }
};

export default command;
