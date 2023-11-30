import { Platform } from '../../enums';

const command: Command = {
  name: 'translate',
  followerOnly: true,
  queued: true,
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    let reply;
    if (!ctx.body) {
      reply = `Please provide the message to translate`;
    } else {
      reply = JSON.parse(await services.openaiService.translate(ctx.body));
    }

    // Make any necessary changes based on the platform
    if (ctx.platform === 'twitch') {
      // Doesn't respond with the owners name if the owner is the one who sent the message
      // This helps with ownerSendCommandDirectly so it doesn't look like
      // blunderBot is responding to itself or the owner
      reply = `${
        !ctx.tags.owner ? `@${ctx.tags.username}: ` : ''
      }Translation: ${reply.translation} (${reply.language})`;
      ctx.botSpeak(reply);
    } else {
      reply = `${
        !ctx.tags.owner ? `<@${ctx.tags.userId}>: ` : ''
      }Translation: ${reply.translation} (${reply.language})`;
      ctx.botSpeak(reply);
    }

    return true;
  }
};

export default command;
