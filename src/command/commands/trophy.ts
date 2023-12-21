import { Platform } from '../../enums';
import { removeSymbols } from '../../utils/utils';

const command: Command = {
  name: 'trophy',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    void services.twitchService.ownerRunCommand(`!king secret_trophy`);
    void services.twitchService.ownerRunCommand(
      `!tts ${removeSymbols(
        ctx.tags['display-name']
      )} wants you to know that you've got yourself another Rosen trophy.`
    );
    return true;
  }
};

export default command;
