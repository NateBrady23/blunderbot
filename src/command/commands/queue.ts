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
      ctx.isOwner
    ) {
      const next = commandState.challengeQueue.shift();
      await ctx.botSpeak(
        `${next.twitchUser}->${next.lichessUser} has been removed from the queue (in a good way)`
      );
    }

    if (queueCommand === 'add' && ctx.isOwner) {
      commandState.challengeQueue.push({
        twitchUser: ctx.args[1],
        lichessUser: ctx.args.slice(2).join(' ')
      });
      await ctx.botSpeak(`@${ctx.args[1]} has joined the queue!`);
      void services.twitchService.ownerRunCommand(
        `!tts ${removeSymbols(ctx.args[1])} has joined the queue!`
      );
    }

    if (queueCommand === 'clear' && ctx.isOwner) {
      commandState.challengeQueue = [];
      await ctx.botSpeak('The queue has been cleared');
    }

    // Open and close can only be used if the challengeRewardId is set
    // and only if this reward was created by the bot (same client id)
    if (services.configV2Service.get().twitch?.challengeRewardId) {
      if (queueCommand === 'open' && ctx.isOwner) {
        void services.twitchService.updateCustomReward(
          services.configV2Service.get().twitch.challengeRewardId,
          { is_enabled: true }
        );
        await ctx.botSpeak('The queue is now open');
      }

      if (queueCommand === 'close' && ctx.isOwner) {
        void services.twitchService.updateCustomReward(
          services.configV2Service.get().twitch.challengeRewardId,
          { is_enabled: false }
        );
        await ctx.botSpeak('The queue is now closed');
      }
    }

    if (!commandState.challengeQueue.length) {
      await ctx.botSpeak('The queue is empty');
    } else {
      await ctx.botSpeak(
        'The queue is: ' +
          commandState.challengeQueue
            .map((c) => `${c.twitchUser}->${c.lichessUser}`)
            .join(', ')
      );
    }

    return true;
  }
};

export default command;
