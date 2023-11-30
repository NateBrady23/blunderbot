import { Platform } from '../../enums';

const command: Command = {
  name: 'queue',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const queueCommand = (ctx.args[0] || '').toLowerCase();
    const challengeQueue = services.twitchService.getChallengeQueue();

    if (challengeQueue.length && queueCommand === 'pop' && ctx.tags.owner) {
      const next = challengeQueue.shift();
      ctx.botSpeak(
        `${next.twitchUser}->${next.lichessUser} has been removed from the queue (in a good way)`
      );
    }

    if (!challengeQueue.length) {
      ctx.botSpeak('The queue is empty');
      return false;
    }

    const toSay = [];
    challengeQueue.forEach((item) => {
      toSay.push(`${item.twitchUser}->${item.lichessUser}`);
    });
    ctx.botSpeak('The queue is: ' + toSay.join(', '));

    return true;
  }
};

export default command;
