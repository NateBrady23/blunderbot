/**
 * This is the starting point for the configuration for BlunderBot, however nothing
 * in this file needs to be changed (except nickname to your own). You can leave everything
 * else disabled until you're ready to use it.
 *
 * To get BlunderBot working, you will need fill in the config.twitch.sample.ts and
 * config.lichess.sample.ts files after you rename them to config.twitch.ts and
 * config.lichess.ts respectively.
 *
 * All other sample files are optional. If you want to use them, rename them to remove
 * the .sample, fill in the proper values, and restart BlunderBot to enable them.
 */
const config: Partial<UserConfig> = {
  // If you change either of these ports, you'll have to manually change them in
  // in files in the public folder. BlunderBot uses port 3000 for http communication
  // in browser source files because of limitations in OBS. It uses port 3001 for websockets
  // for the same reason. Hoping to keep this to one port in the future, but for now, NestJS
  // doesn't make multiple websocket adapters easy. Port 443 is used for https for the extension
  // to work.
  port: 3000,
  wsPort: 3001,

  nickname: 'BM Nate Brady',
  commandsListUrl:
    'https://github.com/NateBrady23/blunderbot/blob/main/COMMANDS.md',

  // A list of commands you want disabled at the start of every stream
  killedCommands: ['somecommand', 'someothercommand'],

  // A list of commands that won't show up in the !blunder commands list.
  // None of the owner, mod commands, or simple message commands show up there by default.
  hiddenCommands: [
    'clock',
    'dadjoke',
    'followage',
    'follows',
    'redsox',
    'skipsong',
    'subscribers',
    'title',
    'trophy'
  ],

  // Some commands require the decapi API. If disabled, those commands will not work.
  decapi: {
    enabled: false,
    token: 'your-token'
  },

  heartRate: {
    enabled: false,
    // Web URL for heart rate monitor
    url: 'https://app.hyperate.io/######',
    // Class where BlunderBot can pull just the heart rate text from
    class: '.heartrate'
  },

  giphy: {
    enabled: false,
    apiKey: 'your-token'
  },

  // Use multiple keys to avoid rate limiting if you want, though I haven't had that problem.
  // When a command requiring a key is used, the bot will choose a random key from the list.
  // You only need one, though. You can get a free key at https://rapidapi.com/
  rapidApi: {
    enabled: false,
    keys: ['your key']
  },

  // You probably don't need this
  youtube: {
    enabled: false,
    apiKey: 'your-key',
    shortsPlaylistId: 'PLI3ZmOU7TLd_dTZGyzfUmi2-KfYHmOSDc'
  },

  // Mutes or unmutes Firefox and Streamlabs OBS. I use one or both of these apps to play music
  // while streaming, and I want to mute them when I play a sound effect or BlunderBot talks.
  sounds: {
    mute: {
      programs: [
        'SoundVolumeView /Mute "C:\\Program Files\\Mozilla Firefox\\firefox.exe"',
        'SoundVolumeView /Mute "C:\\Program Files\\Streamlabs OBS\\Streamlabs OBS.exe"'
      ]
    },
    unmute: {
      programs: [
        'SoundVolumeView /Unmute "C:\\Program Files\\Mozilla Firefox\\firefox.exe"',
        'SoundVolumeView /Unmute "C:\\Program Files\\Streamlabs OBS\\Streamlabs OBS.exe"'
      ]
    }
  }
};

export default config;
