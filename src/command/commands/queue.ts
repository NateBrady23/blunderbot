import { Platform } from '../../enums';
import { removeSymbols } from '../../utils/utils';

const command: Command = {
  name: 'queue',
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    const queueCommand = (ctx.args[0] || '').toLowerCase();

    if (
      commandState.challengeQueue.length &&
      queueCommand === 'pop' &&
      ctx.tags.owner
    ) {
      const next = commandState.challengeQueue.shift();
      ctx.botSpeak(
        `${next.twitchUser}->${next.lichessUser} has been removed from the queue (in a good way)`
      );
    }

    if (queueCommand === 'add' && ctx.tags.owner) {
      commandState.challengeQueue.push({
        twitchUser: ctx.args[1],
        lichessUser: ctx.args.slice(2).join(' ')
      });
      ctx.botSpeak(`@${ctx.args[1]} has joined the queue!`);
      void services.twitchService.ownerRunCommand(
        `!tts ${removeSymbols(ctx.args[1])} has joined the queue!`
      );
    }

    if (!commandState.challengeQueue.length) {
      ctx.botSpeak('The queue is empty');
      return false;
    }

    ctx.botSpeak(
      'The queue is: ' +
        commandState.challengeQueue
          .map((c) => `${c.twitchUser}->${c.lichessUser}`)
          .join(', ')
    );

    return true;
  }
};

export default command;
