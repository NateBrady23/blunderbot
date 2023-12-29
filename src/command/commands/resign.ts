import { Platform } from '../../enums';
import { removeSymbols } from '../../utils/utils';

const command: Command = {
  name: 'resign',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    void services.twitchService.ownerRunCommand(
      `!tts ${removeSymbols(
        ctx.tags['display-name']
      )} wants you to know that it's time to end this madness.`
    );
    return true;
  }
};

export default command;
