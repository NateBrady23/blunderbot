import { getRandomElement } from '../../utils/utils';
import openings from '../../data/puzzle-openings';
import { Platform } from '../../enums';

const command: Command = {
  name: 'puzzle',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    void ctx.botSpeak(getRandomElement(openings));
    return true;
  }
};

export default command;
