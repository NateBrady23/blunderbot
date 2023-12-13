[![Twitch Status](https://img.shields.io/twitch/status/NateBrady23)](https://twitch.tv/NateBrady23)
[![Discord](https://img.shields.io/discord/833463969027981332?label=Discord&logo=discord&style=flat)](https://discord.gg/MfsRvaMeqU)
[![YouTube Channel Subscribers](https://img.shields.io/youtube/channel/subscribers/UCNmr4iM5RfHc8L_DfIIb_ow)](https://youtube.com/@natebrady)
[![GitHub License](https://img.shields.io/github/license/NateBrady23/blunderbot)](https://github.com/NateBrady23/blunderbot/blob/main/LICENSE)

# BlunderBot

An interactive Twitch and Discord bot for chess streamers.

You may see some references to chess.com, but currently BlunderBot only supports lichess.org.

### WARNING

This is a work in progress. This was a personal project I had worked on for a couple of years and I'm releasing it before I think it's ready, but it will help me work harder on it. Though it works for me, there's still a lot of hard coded details that might not make it ideal for others. Feel free to contribute, fork, and use however you'd like; but don't tell me I blundered!

I may iterate quickly on the main branch while this is still v0.* without warning but aim for a v1.0 release soon.

## Setup

The setup is fairly complicated, due to the fact that all major browsers have disabled the ability to turn off CSP in meta tags/headers. This means we have to set up a proxy to allow certain injections into the lichess frontend.

BlunderBot, as is, only works on Windows, but I'm working toward making it OS agnostic.

Along with the software mentioned below, you'll need to have Visual Studio installed for `node-gyp`. Working on removing that.

### Fiddler Proxy

Note: You can use any proxy you want, but this is the one I use.

Download and install [Fiddler](https://www.telerik.com/download/fiddler) V4

Make sure these rewrites are applied in the AutoResponder tab:

```
regex:https://lichess1?.org/blunderbot/*	http://localhost:3000/
regex:https://lichess.org/socket.io/*	http://localhost:3000/socket.io/
regex:*://socket5.lichess.org/twitch-socket/*	ws://localhost:3000/twitch-socket/
regex:https://www.chess.com/socket.io/*	http://localhost:3000/socket.io/
regex:https://lichess1?.org/giphy/*   https://i.giphy.com/
```

### Add this Monkey Script to your browser

I use [Violentmonkey](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag?pli=1) for Chrome. 

Add the script `public/scripts/lichess-violentmonkey.js`


### Some other settings

These settings may be important to get the overlay to work properly. The size of the browser window doesn't matter, it's just what I use for my streamlabs layout, but the size of the lichess board does.

 - Google Chrome Browser window in FanzyZones is 1265x938
 - The lichess board is 677.33 x 677.33
 - Each square is 84.667x84.667

Most of the css selectors are based on the brown theme, so you'll need to switch to that if it's not already set. Working on removing this restriction as well.

<img width="163" alt="image" src="https://github.com/NateBrady23/blunderbot/assets/1304934/7a712ef0-4654-425c-b37e-4dddb1de64e2">

### Additional Software

I use [SoundVolumeView](https://www.nirsoft.net/utils/sound_volume_view.html) to mute or unmute desktop applications that may be playing music so BlunderBot is easier to hear.

I use ffmpeg to capture the length of audio clips for mute duration and may end up using it for other things.

I'll try to make those OS agnostic in the future.

### Environment Variables

Copy the `.env.sample` to `.env` and fill in the values. You can ignore certain sections like Discord and Slack by leaving the *_ENABLED variables set to false.

Copy the `config.yml.sample` to `config.yml` and change things around as you see fit.

*IMPORTANT*: A lot of files (especially sounds) listed in the `config.yml` may not exist. Be sure to add your own! Sound files that don't exist will show an error message in the log and won't play but won't crash the bot.
