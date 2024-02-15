import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'title',
  aliases: ['status'],
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    if (!CONFIG.get().decapi?.enabled) {
      console.log('DecAPI is not enabled for !title command.');
      return false;
    }
    const url = `https://decapi.me/twitch/status/${
      services.configV2Service.get().twitch.ownerUsername
    }`;
    const res = await (await fetch(url)).text();
    ctx.botSpeak(res);
    return true;
  }
};

export default command;
