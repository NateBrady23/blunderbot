import { Platform } from '../../enums';
import { removeSymbols } from '../../utils/utils';

const command: Command = {
  name: 'clock',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    void services.twitchService.ownerRunCommand(
      `!tts ${removeSymbols(
        ctx.tags['display-name']
      )} wants you to know that you're running low on the clock.`
    );
    return true;
  }
};

export default command;
