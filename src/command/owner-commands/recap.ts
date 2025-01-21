import { Platform } from '../../enums';

const command: Command = {
  name: 'recap',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    if (
      !services.configV2Service.get().openai.enabled ||
      !services.configV2Service.get().openai.ttsModel
    ) {
      console.log(`OpenAI is not enabled in !recap command.`);
      return false;
    }
    let res = await fetch(
      `https://lichess.org/api/team/bradys-blunder-buddies/arena?max=2`
    );
    const arenas = await res.text();

    const arena = arenas
      .trim()
      .split('\n')
      .map((a) => JSON.parse(a))
      .find((arena) => arena.winner);

    res = await fetch(`https://lichess.org/api/tournament/${arena.id}`);
    const tournament = await res.json();

    const prompt = `
    Say thank you to the ${arena.nbPlayers} players who played in the ${arena.fullName} today.
    Write a summary of these tournament results in an exciting manner:
    There were a total of ${tournament.stats.games} games played.
    1st place was ${tournament.podium[0].name} with ${tournament.podium[0].score} points with a performance rating of ${tournament.podium[0].performance}.
    2nd place was ${tournament.podium[1].name} with ${tournament.podium[1].score} points.
    3rd place was ${tournament.podium[2].name} with ${tournament.podium[2].score} points.
    `;

    await services.twitchService.ownerRunCommand(`!vchat ${prompt}`);

    return true;
  }
};

export default command;
