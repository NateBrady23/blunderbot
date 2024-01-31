import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'song',
  help: 'Information about the song being played if it part of a queue.',
  aliases: ['music'],
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    if (!CONFIG.get().spotify?.enabled) {
      console.log('Spotify is not enabled for !song.');
      return false;
    }
    const track = await services.spotifyService.getCurrentTrack();
    if (!track) {
      ctx.reply(ctx, "I couldn't find the current song.");
      return false;
    }
    ctx.reply(
      ctx,
      `Currently playing: ${services.spotifyService.getTrackInfoFromTrack(track)}.`
    );
    return true;
  }
};

export default command;
