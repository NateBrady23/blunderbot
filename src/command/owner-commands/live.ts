import { Platform } from '../../enums';

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
    let sendToDiscord =
      services.configV2Service.get().discord?.enabled &&
      !!services.configV2Service.get().discord?.announcementChannelId;
    let sendToTwitter =
      services.configV2Service.get().twitter?.enabled &&
      services.configV2Service.get().twitter?.announceLive;

    commandState.isLive = true;
    await services.twitchService.ownerRunCommand('!autochat on');
    void ctx.botSpeak(`We're live!`);

    if (msg.toLowerCase().includes('nodiscord')) {
      msg = msg.replace(/nodiscord/gi, '');
      sendToDiscord = false;
    }

    if (msg.toLowerCase().includes('notwitter')) {
      msg = msg.replace(/notwitter/gi, '');
      sendToTwitter = false;
    }

    if (!sendToDiscord && !sendToTwitter) {
      return true;
    }

    if (!msg) {
      try {
        msg = await services.openaiService.sendPrompt(
          `We're about to go live on twitch. Say something to get people excited`,
          {
            temp: 1.4,
            includeBlunderBotContext: true
          }
        );
      } catch (e) {
        msg = `Are you ready? We're live!`;
      }
    }

    if (sendToDiscord) {
      services.discordService.makeAnnouncement(
        `@everyone ${msg} https://twitch.tv/${services.configV2Service.get().twitch.ownerUsername}`
      );
    }

    if (sendToTwitter) {
      void services.twitterService.postTweet(
        `${msg} https://twitch.tv/${services.configV2Service.get().twitch.ownerUsername}`
      );
    }

    return true;
  }
};

export default command;
