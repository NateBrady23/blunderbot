import { getRandomElement } from '../../utils/utils';
import { Platform } from '../../enums';

const command: Command = {
  name: 'random',
  help: 'Choose a random thing from a list. Example: !random apples, oranges, bananas',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    if (!ctx.body) {
      await ctx.botSpeak(command.help);
      return false;
    }
    const items = ctx.body
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item?.length);
    await ctx.botSpeak(getRandomElement(items));
    return true;
  }
};

export default command;
