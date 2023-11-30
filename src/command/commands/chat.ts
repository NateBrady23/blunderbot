import { Platform } from '../../enums';

const command: Command = {
  name: 'chat',
  help: 'Talk to BlunderBot! Also @BlunderBot in the beginning or end of a message to talk.',
  followerOnly: true,
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    let reply: string;
    if (!ctx.body) {
      reply = `You need to say something for me to respond to.`;
    } else {
      reply = await services.openaiService.getReplyFromContext(ctx, {
        services
      });
    }

    // Make any necessary changes based on the platform
    if (ctx.platform === 'twitch') {
      // Doesn't respond with the owners name if the owner is the one who sent the message
      // This helps with ownerSendCommandDirectly for things like !ask so it doesn't look like
      // blunderBot is responding to itself or the owner
      reply = `${!ctx.tags.owner ? `@${ctx.tags.username}: ` : ''}${reply}`;
      ctx.botSpeak(reply);
    } else {
      reply = `${!ctx.tags.owner ? `<@${ctx.tags.userId}>: ` : ''}${reply}`;
      ctx.botSpeak(reply);
    }

    return true;
  }
};

export default command;
