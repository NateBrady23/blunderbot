import { Platform } from '../../enums';

const command: Command = {
  name: 'game',
  help: `Displays a link to the currently played game by user. If no user, defaults to the streamer.`,
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    let user = services.configV2Service.get().lichess.user;
    if (ctx.args[0]) {
      user = ctx.args[0];
    }
    const res = await services.lichessService.getCurrentGame(user);
    if (!res) {
      void ctx.botSpeak(`I can't find a game for that user.`);
      return true;
    }
    void ctx.botSpeak(`${user} is playing ${res}`);
    return true;
  }
};

export default command;
