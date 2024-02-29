import { Platform } from '../../enums';

interface MlbGames {
  dates: MlbDate[];
}

interface MlbDate {
  date: string;
  games: MlbGame[];
}

type GameState = 'In Progress' | 'Final' | 'Scheduled';
type TeamName = 'Boston Red Sox';

interface MlbGame {
  status: {
    detailedState: GameState;
  };
  teams: {
    away: {
      score: number;
      team: {
        name: TeamName;
      };
    };
    home: {
      score: number;
      team: {
        name: TeamName;
      };
    };
  };
}

let currentInterval: undefined | ReturnType<typeof setTimeout>;
let lastGameStatus: string = '';

async function getRedSoxGame(ctx: Context) {
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/schedule/games/?sportId=1`
  );
  const json = (await res.json()) as MlbGames;
  const games = json.dates[0].games;

  // TODO: This won't work well for double headers
  const redSoxGame = games.find(
    (game) =>
      game.teams.away.team.name === 'Boston Red Sox' ||
      game.teams.home.team.name === 'Boston Red Sox'
  );

  if (!redSoxGame) {
    void ctx.botSpeak('No Red Sox game today');
    return;
  }

  const currentGameStatus = `(${redSoxGame.status.detailedState}) ${redSoxGame.teams.away.team.name}: ${redSoxGame.teams.away.score}, ${redSoxGame.teams.home.team.name}: ${redSoxGame.teams.home.score}`;
  if (lastGameStatus !== currentGameStatus) {
    void ctx.botSpeak(currentGameStatus);
  }
  lastGameStatus = currentGameStatus;

  // No need to give updates if the game is no longer in progress or we didn't find a game
  if (redSoxGame.status.detailedState !== 'In Progress') {
    clearInterval(currentInterval);
  }
}

const command: Command = {
  name: 'redsox',
  aliases: ['boston', 'bosox', 'bos', 'sox'],
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    // If someone ran the command, erase the last game status so we can give the current score
    lastGameStatus = null;
    clearInterval(currentInterval);
    await getRedSoxGame(ctx);
    currentInterval = setInterval(async () => {
      await getRedSoxGame(ctx);
    }, 1000 * 60);
    return true;
  }
};

export default command;
