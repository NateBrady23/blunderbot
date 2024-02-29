[![Twitch Status](https://img.shields.io/twitch/status/NateBrady23)](https://twitch.tv/NateBrady23)
[![Discord](https://img.shields.io/discord/833463969027981332?label=Discord&logo=discord&style=flat)](https://discord.gg/MfsRvaMeqU)
[![YouTube Channel Subscribers](https://img.shields.io/youtube/channel/subscribers/UCNmr4iM5RfHc8L_DfIIb_ow)](https://youtube.com/@natebrady)
[![GitHub License](https://img.shields.io/github/license/NateBrady23/blunderbot)](https://github.com/NateBrady23/blunderbot/blob/main/LICENSE)

# BlunderBot

An interactive Twitch and Discord bot for chess streamers.

You may see some references to chess.com, but currently BlunderBot only supports lichess.org.

## Setup

The setup is much easier in v1.6.0. Here are the steps. You'll find more details about each step below.

1. Install Chrome Extension
2. Edit config file
3. Run server for the first time (`npm install`, `npm run start`)
4. Visit https://localhost in your browser and accept the risk of the self-signed certificate
5. Visit https://www.blunder.bot to configure the bot
6. Visit https://lichess.org and enjoy!

### Chrome Extension

- Visit `chrome://extensions` in your browser
- Click `Load unpacked` and select the `public` folder
- Click the puzzle piece icon in the top right of your browser and pin the BlunderBot extension (optional for easier access)

Reminder: If you're doing development, you'll need to reload the extension after making changes. You can do this by clicking the reload icon in the extension details in `chrome://extensions`.

Note: Not all files in the public folder are needed for the extension to work, but some files, like utils.js, are shared between the extension and things like the overlay HTML files.

### Configuration

- Copy `src/config/config.sample.ts` to `src/config/config.ts` making sure to connect to your database.
- Visit https://www.blunder.bot to configure the bot

Note: I am using https://planetscale.com for a free MySQL database. It has a very generous free tier plan for projects like this.

### Some other settings

These settings may be important to get the overlay to work properly. The size of the browser window doesn't matter, it's just what I use for my streamlabs layout, but the size of the lichess board does.

- Google Chrome Browser window in FanzyZones is 1265x938
- The lichess board is 677.33 x 677.33
- Each square is 84.667x84.667

Most of the css selectors are based on the brown theme, so you'll need to switch to that if it's not already set. Working on removing this restriction as well.

<img width="163" alt="image" src="https://github.com/NateBrady23/blunderbot/assets/1304934/7a712ef0-4654-425c-b37e-4dddb1de64e2">

### Additional Software

I use [SoundVolumeView](https://www.nirsoft.net/utils/sound_volume_view.html) to mute or unmute desktop applications that may be playing music so BlunderBot is easier to hear. This is now configurable in the `config.ts` under `sounds.mute` and `sounds.unmute`. You can change the entire command that runs by Node's `execSync` to whatever you'd like to use.

I use ffmpeg to capture the length of audio clips for mute duration and may end up using it for other things.

### Overlays / Browser Source

Some commands require adding a browser source to your streaming software.

For the `!alert` command to show up, add a browser source that points to: `http://localhost:3000/blunder-alerts.html`

For the `!image` command, add a browser source that points to: `http://localhost:3000/images.html`

For the `!background` command, add a browser source that points to: `http://localhost:3000/background.html`

For the `!confetti` command and future full screen overlays, add a browser source that points to: `http://localhost:3000/full-screen.html`

Replace with a different port if you changed the `port` in the `config.yml`.

### Cursors

To convert SVG->PNG->CUR, necessary for custom css cursors:

```bash
## svg to png
npm install --global convert-svg-to-png
convert-svg-to-png blunder.svg

## png to cur
icotool --create --cursor --output=blunder.cur blunder.png
```
