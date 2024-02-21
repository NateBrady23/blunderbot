import { Platform } from '../../enums';

const command: Command = {
  name: 'title',
  aliases: ['status'],
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    const url = `https://decapi.me/twitch/status/${
      services.configV2Service.get().twitch.ownerUsername
    }`;
    const res = await (await fetch(url)).text();
    ctx.botSpeak(res);
    return true;
  }
};

export default command;
