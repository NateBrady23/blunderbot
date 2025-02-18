import { scheduleAt } from 'src/utils/utils';
import { Platform } from '../../enums';
import { components } from '@lichess-org/types';

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
      services.configV2Service.get().discord.enabled &&
      !!services.configV2Service.get().discord.announcementChannelId;
    let sendToBluesky =
      services.configV2Service.get().bluesky.enabled &&
      services.configV2Service.get().bluesky.announceLive;

    const now = new Date();

    commandState.isLive = true;
    await services.twitchService.ownerRunCommand('!autochat on');
    void ctx.botSpeak(`We're live!`);

    if (msg.toLowerCase().includes('nodiscord')) {
      msg = msg.replace(/nodiscord/gi, '');
      sendToDiscord = false;
    }

    if (msg.toLowerCase().includes('nobluesky')) {
      msg = msg.replace(/nobluesky/gi, '');
      sendToBluesky = false;
    }

    if (!sendToDiscord && !sendToBluesky) {
      return true;
    }

    if (!msg) {
      try {
        msg = await services.openaiService.sendPrompt(
          `We're about to go live on twitch. Say something to get people excited. Under 500 characters.`,
          {
            temp: 1.4,
            includeBlunderBotContext: true
          }
        );
      } catch (e) {
        console.error(e);
        msg = `Are you ready? We're live!`;
      }
    }

    if (sendToDiscord) {
      services.discordService.makeAnnouncement(
        `@everyone ${msg} https://twitch.tv/${services.configV2Service.get().twitch.ownerUsername}`
      );
    }

    if (sendToBluesky) {
      void services.blueskyService.post(
        `${msg} https://twitch.tv/${services.configV2Service.get().twitch.ownerUsername}`
      );
    }

    scheduleAt('19:50', async () => {
      await services.twitchService.ownerRunCommand('!sound dairyqueen');
    });

    let res = await fetch(
      `https://lichess.org/api/team/bradys-blunder-buddies/arena?max=2`
    );
    const arenas = await res.text();

    const nextBbb = arenas
      .trim()
      .split('\n')
      .map(
        (a) =>
          JSON.parse(a) as components["schemas"]["ArenaTournament"]
      )
      .find((arena) => arena.secondsToStart);

    if (nextBbb && nextBbb.secondsToStart < 60 * 60 * 2) {
      scheduleAt('18:58', async () => {
        await services.twitchService.ownerRunCommand(
          `!vchat Announce that the BBB is starting in 2 minutes.
          Encourage people to join and vie for the BBB title and by joining the team and clicking the link in the chat.`
        );
        await services.twitchService.ownerRunCommand('!bbb');
      });

      ['19:15', '19:30', '19:45'].forEach((time) =>
        scheduleAt(
          time,
          async () =>
            await services.twitchService.ownerRunCommand('!commentary')
        )
      );

      scheduleAt(
        '20:01',
        async () => await services.twitchService.ownerRunCommand('!recap')
      );
    }

    return true;
  }
};

export default command;
