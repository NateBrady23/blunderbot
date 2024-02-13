import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'songrequest',
  help: 'Request a song to be played on stream.',
  aliases: ['sr'],
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    if (!CONFIG.get().spotify?.enabled) {
      console.log('Spotify is not enabled for !songrequest.');
      return false;
    }
    const query = ctx.body?.trim();
    if (!query) {
      ctx.botSpeak('Please provide a song to request.');
      return false;
    }

    let track;

    if (query.includes('spotify.com/track/')) {
      // Get the id from url that looks like https://open.spotify.com/track/0dymahiZQrRBzYTRg9QK9i?si=fb0b49338d6a4f7c
      const id = query.split('track/')[1].split('?')[0];
      track = await services.spotifyService.getTrackById(id);
    } else {
      track = await services.spotifyService.getTrackFromSearch(query);
    }

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
      const user = ctx.onBehalfOf || ctx.displayName;
      const trackDetails = services.spotifyService.getTrackInfoFromTrack(track);
      commandState.spotify.requests[trackDetails] = user;
      ctx.reply(ctx, `${trackDetails} added to queue.`);
      if (
        services.configV2Service.get().discord.enabled &&
        services.configV2Service.get().discord.musicChannelId
      ) {
        void services.discordService.botSpeak(
          { channelId: services.configV2Service.get().discord.musicChannelId },
          `Song request added to queue by @${user} on Twitch: ${trackDetails}. Link: ${track.external_urls.spotify}`
        );
      }
      return true;
    } else {
      ctx.reply(ctx, "I couldn't add that song to the queue.");
      return false;
    }
  }
};

export default command;
