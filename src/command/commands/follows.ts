import { CONFIG } from '../../config/config.service';
import { Platform } from '../../enums';

const channel = CONFIG.twitch.channel;

const command: Command = {
  name: 'follows',
  help: `How many followers does ${channel} have on Twitch?`,
  aliases: ['followers', 'followercount', 'followcount'],
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    const url = `https://decapi.me/twitch/followcount/${channel}`;

    const res = await (await fetch(url)).text();
    ctx.botSpeak(`${channel} has ${res} followers on Twitch!`);

    return true;
  }
};

export default command;
