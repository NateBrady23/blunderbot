import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'reload',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (_ctx) => {
    CONFIG.loadConfig();
    return true;
  }
};

export default command;
