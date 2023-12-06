import { Platform } from '../../enums';
import { ENV } from '../../config/config.service';

const command: Command = {
  name: 'live',
  ownerOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    let msg = ctx.body;

    commandState.isLive = true;
    await services.twitchService.ownerRunCommand('!autochat on');

    if (!ENV.DISCORD_ENABLED) {
      return true;
    }

    if (!msg) {
      try {
        msg = await services.openaiService.sendPrompt(
          'The blunder master is about to go live on twitch. Say something to get people excited',
          {
            temp: 1.4,
            includeBlunderBotContext: true
          }
        );
      } catch (e) {
        msg =
          "Are you ready? It's time. The Blunder Master is here and he's ready to play some chess!";
      }
    }

    services.discordService.makeAnnouncement(
      `@everyone ${msg} https://twitch.tv/${ENV.TWITCH_CHANNEL}`
    );
    return true;
  }
};

export default command;
