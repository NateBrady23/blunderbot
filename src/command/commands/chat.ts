import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'chat',
  help: 'Talk to BlunderBot! Also @BlunderBot in the beginning or end of a message to talk.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    if (!CONFIG.get().openai?.enabled) {
      console.log('OpenAI disabled in !chat command');
      return false;
    }

    if (ctx.isBot) {
      console.log('Disabled: Bot attempting to use !chat command.');
      return false;
    }

    let reply: string;
    if (!ctx.body) {
      reply = `You need to say something for me to respond to.`;
    } else {
      reply = await services.openaiService.getReplyFromContext(ctx, services);
    }

    // Make any necessary changes based on the platform
    if (ctx.platform === Platform.Twitch) {
      // Doesn't respond with the owners name if the owner is the one who sent the message
      // This helps with ownerSendCommandDirectly for things like !ask so it doesn't look like
      // blunderBot is responding to itself or the owner
      const mention = ctx.isOwner ? '' : `@${ctx.username}: `;
      ctx.botSpeak(`${mention}${reply}`);
    } else {
      const mention = ctx.isOwner ? '' : `<@${ctx.userId}>: `;
      ctx.botSpeak(`${mention}${reply}`);
    }

    return true;
  }
};

export default command;
