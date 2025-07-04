/**
 * Usage:
 *   !gpredict -- just starts a game prediction
 *   !grepdict "Will Nate win?" "Yes" "No" "Draw" -- starts a prediction with custom options
 *   !gpredict win -- resolves the prediction as a win
 */

import { getItemsBetweenDelimiters } from '../../utils/utils';
import { Platform } from '../../enums';

const command: Command = {
  name: 'gpredict',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    let items = getItemsBetweenDelimiters(ctx.body || '', '"');

    // Starting a new prediction with no custom options.
    if (!ctx.args[0] && !items.length) {
      const currentGame =
        (await services.lichessService.getCurrentGame(
          services.configV2Service.get().lichess?.user,
          {
            gameId: true
          }
        )) || '';
      items = [
        `Game result for ${services.configV2Service.get().lichess?.user}? ${currentGame}`,
        'Win',
        'Loss',
        'Draw'
      ];
    }

    // This means we're starting a new prediction.
    if (items.length === 4) {
      const res = (await services.twitchService.helixApiCall(
        'https://api.twitch.tv/helix/predictions',
        'POST',
        {
          broadcaster_id: services.configV2Service.get().twitch?.ownerId,
          title: items[0],
          outcomes: [
            { title: items[1] },
            { title: items[2] },
            { title: items[3] }
          ],
          prediction_window: 90
        }
      )) as { data: { id: string } };

      if (!res?.data) {
        void ctx.botSpeak(
          'Something went wrong creating the prediction. Is there already an active prediction?'
        );
        return false;
      }

      if (
        services.configV2Service.get().openai?.enabled &&
        services.configV2Service.get().openai?.ttsModel
      ) {
        const msg = await services.openaiService.sendPrompt(
          `
        Make an announcement that a prediction is now available.
        Tell people in 2 sentences or less that they can wager their "Blunder Bucks" to predict
        ${items.join(', ')}.
        `,
          {
            usePersonality: true
          }
        );
        await services.twitchService.ownerRunCommand(`!tts ${msg}`);
      }
      return true;
    }

    const res = (await services.twitchService.helixApiCall(
      `https://api.twitch.tv/helix/predictions?broadcaster_id=${
        services.configV2Service.get().twitch?.ownerId
      }`,
      'GET',
      undefined
    )) as { data: { id: string }[] };

    const lastPrediction = res.data[0] as {
      id: string;
      outcomes: Array<{
        id: string;
        channel_points: number;
      }>;
    };

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
      broadcaster_id: services.configV2Service.get().twitch?.ownerId || '',
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
    } else if (outcome === 'win' || outcome === '1') {
      req.winning_outcome_id = lastPrediction.outcomes[0].id;
    } else if (outcome === 'loss' || outcome === '2') {
      req.winning_outcome_id = lastPrediction.outcomes[1].id;
    } else if (outcome === 'draw' || outcome === '3') {
      req.winning_outcome_id = lastPrediction.outcomes[2].id;
    }

    await services.twitchService.helixApiCall(
      'https://api.twitch.tv/helix/predictions',
      'PATCH',
      req
    );

    return true;
  }
};

export default command;
