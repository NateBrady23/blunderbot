import { Platform } from '../../enums';

const command: Command = {
  name: 'song',
  help: "Information about the song being played if it's part of a queue.",
  aliases: ['music'],
  platforms: [Platform.Twitch],
  run: async (ctx, { services, commandState }) => {
    if (!services.configV2Service.get().spotify.enabled) {
      console.log('Spotify is not enabled for !song.');
      return false;
    }
    const track = await services.spotifyService.getCurrentTrack();
    if (!track) {
      ctx.reply(ctx, "I couldn't find the current song.");
      return false;
    }
    const trackDetails = services.spotifyService.getTrackInfoFromTrack(track);
    const requester = commandState.spotify.requests[trackDetails];

    let reply = `Currently playing: ${trackDetails}.`;
    if (requester) {
      reply += ` Requested by ${requester}.`;
    }
    ctx.reply(ctx, reply);
    return true;
  }
};

export default command;
