import { Platform } from '../../enums';

const command: Command = {
  name: 'version',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const version = require('../../../package.json').version;

    void ctx.botSpeak(`v${version}`);

    return true;
  }
};

export default command;
