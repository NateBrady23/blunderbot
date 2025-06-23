import SHAPE from '../../data/shapes';
import { Platform } from '../../enums';
import { FunctionQueue } from '../../utils/FunctionQueue';
import { sleep } from '../../utils/utils';

const queue = new FunctionQueue();

const command: Command = {
  name: 'shape',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    return queue.enqueue(async function () {
      let msg = ctx.body?.toLowerCase() || '';
      if (!msg) {
        return false;
      }
      let milliseconds = 5000;

      if (ctx.args[0].startsWith('!s')) {
        msg = ctx.body?.replace(ctx.args[0], '').trim() || '';
        milliseconds = parseInt(ctx.args[0].replace('!s', '')) * 1000;
      }
      if (!SHAPE[msg]) {
        return false;
      }

      services.twitchGateway.sendDataToSockets('serverMessage', {
        type: 'SHAPE',
        shape: SHAPE[msg],
        milliseconds
      });
      await sleep(milliseconds + 1000);
      return true;
    });
  }
};

export default command;
