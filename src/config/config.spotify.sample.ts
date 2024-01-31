/**
 * Not required
 *
 * Must have a Spotify Premium account for this functionality to work.
 *
 * To use the Spotify functionality, you will need to login at https://localhost/spotify/login before
 * each stream. This will redirect you to your queue and allow BlunderBot to add songs to it.
 *
 * If you get an error that there's no active device, you need to keep Spotify open and hit play on your queue.
 */

const userSpotifyConfig: UserSpotifyConfig = {
  enabled: true,
  redirectUri: 'https://localhost/spotify/callback',
  clientId: 'your-client-id-here',
  clientSecret: 'your-client-secret-here',
  // 10 minutes in milliseconds
  maxAllowedSongLengthMs: 10 * 60 * 1000,
  // If you want to allow explicit songs to be added to the queue, set this to true
  allowExplicit: false
};

export default userSpotifyConfig;
