import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'discordspeak',
  ownerOnly: true,
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
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
