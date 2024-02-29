import { Platform } from '../../enums';

const command: Command = {
  name: 'follows',
  help: `How many followers does the streamer have on Twitch?`,
  aliases: ['followers', 'followercount', 'followcount'],
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    const channel = services.configV2Service.get().twitch.ownerUsername;
    const url = `https://decapi.me/twitch/followcount/${channel}`;

    const res = await (await fetch(url)).text();
    void ctx.botSpeak(`${channel} has ${res} followers on Twitch!`);

    return true;
  }
};

export default command;
