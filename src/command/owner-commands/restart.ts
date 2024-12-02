import { Platform } from '../../enums';

const command: Command = {
  name: 'restart',
  platforms: [Platform.Twitch],
  run: async (_ctx, { services }) => {
    const service = _ctx.args[0]?.trim();
    const config = services.configV2Service.get();

    if (!service) {
      void services.configV2Service.init();
      return true;
    }

    if (service === 'twitch' && config.twitch) {
      services.twitchService.init();
      services.twitchPubSub.init();
      services.twitchEventSub.init();
    }

    if (service === 'discord' && config.discord?.enabled) {
      services.discordService.init();
    }

    if (service === 'openai' && config.openai?.enabled) {
      services.openaiService.init();
    }

    if (service === 'bluesky' && config.bluesky?.enabled) {
      services.blueskyService.init();
    }

    return true;
  }
};

export default command;
