import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

/**
 * The !live command without any arguments will announce that the streamer is live on discord if
 * discord is enabled. It will create a message using AI if no message is provided.
 *
 * If the body of the command contains "nodiscord" then the discord announcement will be skipped. This
 * is sometimes necessary if the bot crashed and you want to go back into live mode without
 * announcing it on discord.
 */
const command: Command = {
  name: 'live',
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    let msg = ctx.body;

    commandState.isLive = true;
    await services.twitchService.ownerRunCommand('!autochat on');

    if (!CONFIG.discord.enabled || msg.toLowerCase().includes('nodiscord')) {
      return true;
    }

    if (!msg) {
      try {
        msg = await services.openaiService.sendPrompt(
          `${CONFIG.nickname} is about to go live on twitch. Say something to get people excited`,
          {
            temp: 1.4,
            includeBlunderBotContext: true
          }
        );
      } catch (e) {
        msg = `Are you ready? It's time. ${CONFIG.nickname} is here and he's ready to play some chess!`;
      }
    }

    services.discordService.makeAnnouncement(
      `@everyone ${msg} https://twitch.tv/${CONFIG.twitch.channel}`
    );
    return true;
  }
};

export default command;
