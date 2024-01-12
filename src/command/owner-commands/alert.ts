import { FunctionQueue } from '../../utils/FunctionQueue';
import { sleep } from '../../utils/utils';
import { Platform } from '../../enums';

const queue = new FunctionQueue();

const command: Command = {
  name: 'alert',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    return queue.enqueue(async function () {
      let milliseconds;
      let message = ctx.body;
      if (ctx.args[0].startsWith('!s')) {
        milliseconds = parseInt(ctx.args[0].replace('!s', '')) * 1000;
        message = message.replace(ctx.args[0], '').trim();
      }
      if (!milliseconds) {
        milliseconds = 10000;
      }
      services.appGateway.sendDataToSockets('serverMessage', {
        type: 'ALERT',
        message,
        milliseconds
      });
      await sleep(milliseconds);
    });
  }
};

export default command;
