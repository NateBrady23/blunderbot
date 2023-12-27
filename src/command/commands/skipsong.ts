import { Platform } from '../../enums';
import { removeSymbols } from '../../utils/utils';

const command: Command = {
  name: 'skipsong',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    void services.twitchService.ownerRunCommand(
      `!tts ${removeSymbols(
        ctx.tags['display-name']
      )} has requested you skip this song.`
    );
    return true;
  }
};

export default command;
