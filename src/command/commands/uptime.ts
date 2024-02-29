import { Platform } from '../../enums';

const command: Command = {
  name: 'uptime',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    const url = `https://decapi.me/twitch/uptime/${
      services.configV2Service.get().twitch.ownerUsername
    }`;

    const res = await (await fetch(url)).text();
    if (res.includes('offline')) {
      void ctx.botSpeak(
        `${services.configV2Service.get().twitch.ownerUsername} is offline.`
      );
    } else {
      void ctx.botSpeak(
        `${services.configV2Service.get().twitch.ownerUsername} has been live for ${res}.`
      );
    }
    return true;
  }
};

export default command;
