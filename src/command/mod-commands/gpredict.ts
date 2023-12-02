/**
 * Usage:
 *   !gpredict -- just starts a game prediction
 *   !grepdict "Will Nate win?" "Yes" "No" "Draw" -- starts a prediction with custom options
 *   !gpredict win -- resolves the prediction as a win
 */

import { ENV } from '../../config/config.service';
import { getItemsBetweenDelimiters } from '../../utils/utils';
import { Platform } from '../../enums';

const command: Command = {
  name: 'gpredict',
  modOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const items = getItemsBetweenDelimiters(ctx.body, '"');

    if (!ctx.args[0] || items.length === 4) {
      let currentGame = '';
      // We're doing a game prediction. Get the game link to keep in the prediction, in case we forget.
      if (!ctx.args[0]) {
        currentGame =
          (await services.lichessService.getCurrentGame(ENV.LICHESS_USER, {
            gameId: true
          })) || '';
      }
      await services.twitchService.helixOwnerApiCall(
        'https://api.twitch.tv/helix/predictions',
        'POST',
        {
          broadcaster_id: ENV.TWITCH_OWNER_ID,
          title:
            items[0] || `Game result for ${ENV.LICHESS_USER}? ${currentGame}`,
          outcomes: [
            { title: items[1] || 'Win' },
            { title: items[2] || 'Loss' },
            { title: items[3] || 'Draw' }
          ],
          prediction_window: 90
        }
      );

      const msg = await services.openaiService.sendPrompt(
        `
        Make an announcement that a game prediction is now available.
        Tell people in 2 sentences or less that they can wager their "Blunder Bucks" to predict
        if the Blunder Master will win, lose, or draw his current game.
        `,
        {
          usePersonality: true
        }
      );
      await services.twitchService.ownerRunCommand(`!tts ${msg}`);

      return true;
    }

    const res = await services.twitchService.helixOwnerApiCall(
      `https://api.twitch.tv/helix/predictions?broadcaster_id=${ENV.TWITCH_OWNER_ID}`
    );

    const lastPrediction = res.data[0];

    console.log(lastPrediction);

    if (!lastPrediction) {
      return false;
    }

    let outcome = ctx.args[0].toLowerCase();
    const req: {
      broadcaster_id: string;
      id: string;
      status: string;
      winning_outcome_id?: string;
    } = {
      broadcaster_id: ENV.TWITCH_OWNER_ID,
      id: lastPrediction.id,
      status: 'RESOLVED'
    };

    // If the prediction only has 1 outcome predicted on, just cancel it
    // so those people don't lose their monies.
    let predictionCount = 0;
    for (const outcome of lastPrediction.outcomes) {
      if (outcome.channel_points > 0) {
        predictionCount++;
      }
    }
    if (predictionCount === 1) {
      outcome = 'cancel';
    }

    if (outcome === 'cancel') {
      req.status = 'CANCELED';
    } else if (outcome === 'lock') {
      req.status = 'LOCKED';
    } else {
      if (outcome === 'win' || outcome === '1') {
        req.winning_outcome_id = lastPrediction.outcomes[0].id;
      } else if (outcome === 'loss' || outcome === '2') {
        req.winning_outcome_id = lastPrediction.outcomes[1].id;
      } else if (outcome === 'draw' || outcome === '3') {
        req.winning_outcome_id = lastPrediction.outcomes[2].id;
      }
    }

    await services.twitchService.helixOwnerApiCall(
      'https://api.twitch.tv/helix/predictions',
      'PATCH',
      req
    );

    return true;
  }
};

export default command;
