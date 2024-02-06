import { Platform } from '../../enums';
import { removeSymbols } from '../../utils/utils';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'queue',
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    const queueCommand = (ctx.args[0] || '').toLowerCase();

    if (
      commandState.challengeQueue.length &&
      queueCommand === 'pop' &&
      ctx.isOwner
    ) {
      const next = commandState.challengeQueue.shift();
      ctx.botSpeak(
        `${next.twitchUser}->${next.lichessUser} has been removed from the queue (in a good way)`
      );
    }

    if (queueCommand === 'add' && ctx.isOwner) {
      commandState.challengeQueue.push({
        twitchUser: ctx.args[1],
        lichessUser: ctx.args.slice(2).join(' ')
      });
      ctx.botSpeak(`@${ctx.args[1]} has joined the queue!`);
      void services.twitchService.ownerRunCommand(
        `!tts ${removeSymbols(ctx.args[1])} has joined the queue!`
      );
    }

    if (queueCommand === 'clear' && ctx.isOwner) {
      commandState.challengeQueue = [];
      ctx.botSpeak('The queue has been cleared');
    }

    if (CONFIG.get().twitch.challengeRewardId) {
      if (queueCommand === 'open' && ctx.isOwner) {
        void services.twitchService.updateCustomReward(
          CONFIG.get().twitch.challengeRewardId,
          { is_enabled: true }
        );
        ctx.botSpeak('The queue is now open');
        return true;
      }

      if (queueCommand === 'close' && ctx.isOwner) {
        void services.twitchService.updateCustomReward(
          CONFIG.get().twitch.challengeRewardId,
          { is_enabled: false }
        );
        ctx.botSpeak('The queue is now closed');
        return false;
      }
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
