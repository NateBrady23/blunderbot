import { FunctionQueue } from '../../utils/FunctionQueue';
import { Platform } from '../../enums';

const queue = new FunctionQueue();

const command: Command = {
  name: 'shoutout',
  aliases: ['so'],
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx: Context, { services }) => {
    return queue.enqueue(async function () {
      const user = ctx.args[0]?.replace('@', '');
      if (!user) {
        void ctx.botSpeak('Please provide a twitch username to shoutout');
        return;
      }

      const url = `https://decapi.me/twitch/game/${user}`;

      const res = await (await fetch(url)).text();
      if (res.includes('not found')) {
        void ctx.botSpeak(`Are you sure ${user} exists?`);
      } else {
        void ctx.botSpeak(
          `Blunder Buddies, please join me in following @${user} at https://twitch.tv/${user} ${
            res ? `They were last seen playing ${res}.` : ''
          }`
        );
        void services.twitchService.ownerRunCommand(
          `!alert Blunder Buddies, please join me in following {@${user}}! Link in the chat!`
        );
        void services.twitchService.helixShoutout(user);
        return true;
      }
    });
  }
};

export default command;
