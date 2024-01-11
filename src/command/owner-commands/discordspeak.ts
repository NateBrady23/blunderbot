import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'discordspeak',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    if (!CONFIG.discord?.enabled) {
      console.log(`Discord is not enabled in !discordspeak command.`);
      return false;
    }
    const msg = ctx.body;
    if (msg) {
      const channel = {
        channelId: CONFIG.discord.generalChannelId
      };
      services.discordService.botSpeak(channel, msg);
    }
    return true;
  }
};

export default command;
