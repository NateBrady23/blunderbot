import { components, paths } from '@lichess-org/types';
import { Platform } from '../../enums';

const command: Command = {
  name: 'commentary',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    let res = await fetch(
      `https://lichess.org/api/team/bradys-blunder-buddies/arena?max=2`
    );
    const arenas = await res.text();

    const arena = arenas
      .trim()
      .split('\n')
      .map(
        (a) =>
          JSON.parse(
            a
          ) as paths['/api/team/{teamId}/arena']['get']['responses']['200']['content']['application/x-ndjson']
      )
      .find((arena) => arena.status === 20);

    if (!arena) {
      console.error('No ongoing arena found');
      return false;
    }

    res = await fetch(`https://lichess.org/api/tournament/${arena.id}`);
    const tournament =
      (await res.json()) as components['schemas']['ArenaTournamentFull'];

    if (!tournament) {
      console.error('No tournament found');
      return false;
    }

    const nbPlayers = tournament.nbPlayers;
    const topGames = tournament.duels
      ?.map((duel) => {
        return duel.p?.map((p) => p.n).join(' vs ');
      })
      .join(', ');
    const topPlayers = tournament.standing?.players
      ?.map((player) => {
        return (
          `${player.rank}: ${player.name} with ${player.score} points` +
          (player.sheet?.fire ? ` and currently on a streak` : '')
        );
      })
      .slice(0, 4)
      .join(', ');
    const minutesRemaining = Math.floor((tournament.secondsToFinish || 0) / 60);

    const prompt = `
    Provide an exciting commentary of the ongoing BBB chess tournament.
    It will be read to the players so make it hype and encouraging.
    There are ${minutesRemaining} minutes remaining in the tournament.
    There are currently ${nbPlayers} players in the arena.
    In the lead we have ${topPlayers}.
    Some of the ongoing games are ${topGames}.
    You don't have to mention all of them, but give a shoutout to some of the games.
    `;

    await services.twitchService.ownerRunCommand(`!vchat ${prompt}`);

    return true;
  }
};

export default command;
