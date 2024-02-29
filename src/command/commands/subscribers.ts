import { Platform } from '../../enums';

const command: Command = {
  name: 'subscribers',
  aliases: ['subs', 'subcount'],
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    const url = `https://decapi.me/twitch/subcount/${
      services.configV2Service.get().twitch.ownerUsername
    }`;

    const res = await (await fetch(url)).text();
    void ctx.botSpeak(
      `${services.configV2Service.get().twitch.ownerUsername} has ${res} subscribers on Twitch!`
    );

    return true;
  }
};

export default command;
