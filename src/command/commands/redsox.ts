import { Platform } from '../../enums';

import fetch from 'node-fetch';

function isRedSoxGame(game) {
  if (!game) {
    return false;
  }
  if (
    game.teams.away.team.name === 'Boston Red Sox' ||
    game.teams.home.team.name === 'Boston Red Sox'
  ) {
    return true;
  }
}

async function getRedSoxGame(ctx: Context) {
  let detailedGameState = '';
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/schedule/games/?sportId=1`
  );
  const json = await res.json();
  const games = json.dates[0].games;
  // TODO: This won't work well for double headers
  for (let i = 0; i < games.length; i++) {
    if (isRedSoxGame(games[i])) {
      const currentGameStatus = `(${games[i].status.detailedState}) ${games[i].teams.away.team.name}: ${games[i].teams.away.score}, ${games[i].teams.home.team.name}: ${games[i].teams.home.score}`;
      if (lastGameStatus !== currentGameStatus) {
        ctx.botSpeak(currentGameStatus);
      }
      lastGameStatus = currentGameStatus;
      detailedGameState = games[i].status.detailedState;
    }
  }
  // No need to give updates if the game is no longer in progress or we didn't find a game
  if (detailedGameState !== 'In Progress') {
    clearInterval(currentInterval);
  }
}

let currentInterval = null;
let lastGameStatus = null;

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
