import { Platform } from '../../enums';

const command: Command = {
  name: 'daily',
  help: `Get today's lichess daily puzzle.`,
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    try {
      const res = await services.lichessService.apiCall(
        `https://lichess.org/api/puzzle/daily`
      );
      const json = await res.json();
      if (json?.puzzle) {
        void ctx.botSpeak(
          `Today's lichess daily puzzle is https://lichess.org/training/` +
            json.puzzle.id
        );
      }
    } catch (e) {
      console.error(e);
    }
    return true;
  }
};

export default command;
