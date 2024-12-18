import { Platform } from '../../enums';

const command: Command = {
  name: 'discordspeak',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    if (
      !services.configV2Service.get().discord.enabled ||
      !services.configV2Service.get().discord.generalChannelId
    ) {
      console.log(`Discord is not enabled in !discordspeak command.`);
      return false;
    }
    const msg = ctx.body;
    if (msg) {
      const channel = {
        channelId: services.configV2Service.get().discord.generalChannelId
      };
      void services.discordService.botSpeak(channel, msg);
    }
    return true;
  }
};

export default command;
