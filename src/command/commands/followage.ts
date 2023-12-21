import { CONFIG } from '../../config/config.service';
import { Platform } from '../../enums';

const decapiToken = CONFIG.decapi.token;
const channel = CONFIG.twitch.channel;

const command: Command = {
  name: 'followage',
  help: 'How long a twitch user has been following my channel. If no user is provided, it will display the followage for the user using the command.',
  followerOnly: true,
  hideFromList: true,
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    let user = ctx.args[0];
    if (!user) {
      if (ctx.platform === 'twitch') {
        user = ctx.tags['display-name'];
      } else {
        ctx.botSpeak('Please provide a twitch username to check followage for');
        return false;
      }
    }

    const url = `https://beta.decapi.me/twitch/followage/${channel}/${user}?token=${decapiToken}`;

    const res = await (await fetch(url)).text();
    if (res.includes('does not follow')) {
      ctx.botSpeak(`${user} does not follow https://twitch.tv/${channel}`);
    } else {
      ctx.botSpeak(
        `${user} has been following https://twitch.tv/${channel} for ${res}`
      );
    }

    return true;
  }
};

export default command;
