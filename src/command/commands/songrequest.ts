import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'songrequest',
  aliases: ['sr'],
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    if (!CONFIG.get().spotify?.enabled) {
      console.log('Spotify is not enabled for !songrequest.');
      return false;
    }
    const query = ctx.body?.trim();
    if (!query) {
      ctx.botSpeak('Please provide a song to request.');
      return false;
    }

    const track = await services.spotifyService.getTrackFromSearch(query);
    if (!track) {
      ctx.reply(ctx, "I couldn't find that song on Spotify.");
      return false;
    }
    if (!CONFIG.get().spotify.allowExplicit && track.explicit) {
      ctx.reply(ctx, 'I cannot play explicit songs.');
      return false;
    }
    if (track.duration_ms > CONFIG.get().spotify.maxAllowedSongLengthMs) {
      ctx.reply(
        ctx,
        'That song is too long. Try a more specific request for a shorter song.'
      );
      return false;
    }
    const added = await services.spotifyService.addTrackToQueue(track.uri);
    if (added) {
      ctx.reply(
        ctx,
        `${services.spotifyService.getTrackInfoFromTrack(track)} added to queue.`
      );
      return true;
    } else {
      ctx.reply(ctx, "I couldn't add that song to the queue.");
      return false;
    }
  }
};

export default command;
