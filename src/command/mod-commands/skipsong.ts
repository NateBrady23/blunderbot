import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'skipsong',
  help: 'Skips a song in the spotify queue.',
  aliases: ['music'],
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    if (!CONFIG.get().spotify?.enabled) {
      console.log('Spotify is not enabled for !skipsong.');
      return false;
    }
    const skipped = await services.spotifyService.skipTrack();
    if (skipped) {
      ctx.reply(ctx, 'Song skipped.');
    } else {
      ctx.reply(ctx, "I couldn't skip the song.");
      return false;
    }
    return true;
  }
};

export default command;
