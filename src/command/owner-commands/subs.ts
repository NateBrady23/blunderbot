import { FunctionQueue } from '../../utils/FunctionQueue';
import { Platform } from '../../enums';

const queue = new FunctionQueue();

const command: Command = {
  name: 'subs',
  ownerOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState }) => {
    return queue.enqueue(async function () {
      const body = JSON.parse(ctx.body);
      if (body?.username) {
        commandState.contributions.subs[body.username] = true;
      }
    });
  }
};

export default command;
