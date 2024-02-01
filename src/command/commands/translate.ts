import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'translate',
  queued: true,
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    if (!CONFIG.get().openai?.enabled) {
      console.log(`OpenAI is not enabled in !translate command.`);
      return false;
    }
    if (!ctx.body) {
      ctx.botSpeak('You must provide a message to translate');
      return false;
    }
    let reply = JSON.parse(await services.openaiService.translate(ctx.body));

    // Make any necessary changes based on the platform
    if (ctx.platform === Platform.Twitch) {
      // Doesn't respond with the owners name if the owner is the one who sent the message
      // This helps with ownerSendCommandDirectly so it doesn't look like
      // blunderBot is responding to itself or the owner
      reply = `${
        !ctx.isOwner ? `@${ctx.username}: ` : ''
      }Translation: ${reply.translation} (${reply.language})`;
      ctx.botSpeak(reply);
    } else {
      reply = `${
        !ctx.isOwner ? `<@${ctx.userId}>: ` : ''
      }Translation: ${reply.translation} (${reply.language})`;
      ctx.botSpeak(reply);
    }

    return true;
  }
};

export default command;
