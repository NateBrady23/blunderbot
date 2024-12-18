import { Platform } from '../../enums';

const command: Command = {
  name: 'songrequest',
  help: 'Request a song to be played on stream.',
  aliases: ['sr'],
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    if (!services.configV2Service.get().spotify.enabled) {
      console.log('Spotify is not enabled for !songrequest.');
      return false;
    }
    const query = ctx.body.trim();
    if (!query) {
      void ctx.botSpeak('Please provide a song to request.');
      return false;
    }

    let allowedSongLengthMs =
      services.configV2Service.get().spotify.maxAllowedSongLengthMs;
    // If the request is from a channel point redemption, and the query contains a
    // number in this format !t## then set the max allowed song length to that
    // number of minutes and remove it from the query. This is useful for
    // channel point redemptions for higher song lengths, like: !sr !t10 {message}
    if (ctx.onBehalfOf) {
      const match = query.match(/!t(\d+)/);
      if (match) {
        allowedSongLengthMs = parseInt(match[1], 10) * 60 * 1000;
        query.replace(match[0], '');
      }
    } else if (ctx.isOwner) {
      // If the user is an owner, they can request any song length
      allowedSongLengthMs = 1000000000;
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
    if (
      !services.configV2Service.get().spotify.allowExplicit &&
      track.explicit
    ) {
      ctx.reply(ctx, 'I cannot play explicit songs.');
      return false;
    }

    if (track.duration_ms > allowedSongLengthMs) {
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
