import { Platform } from '../../enums';
import { ENV } from '../../config/config.service';

const command: Command = {
  name: 'title',
  aliases: ['status'],
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    const url = `https://decapi.me/twitch/status/${ENV.TWITCH_CHANNEL}`;
    const res = await (await fetch(url)).text();
    ctx.botSpeak(res);
    return true;
  }
};

export default command;
