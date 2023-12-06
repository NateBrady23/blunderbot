import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ENV } from '../config/config.service';
import { removeSymbols } from '../utils/utils';
import { TwitchService } from './twitch.service';
import { TwitchGateway } from './twitch.gateway';

const challengeQueue = [];

@Injectable()
export class TwitchCustomRewardsService {
  private logger: Logger = new Logger(TwitchCustomRewardsService.name);

  constructor(
    @Inject(forwardRef(() => TwitchGateway))
    private readonly twitchGateway: TwitchGateway,
    @Inject(forwardRef(() => TwitchService))
    private readonly twitchService: TwitchService
  ) {
    //
  }

  async handleCustomRewards(ctx: Context): Promise<void> {
    this.logger.log(`Custom Reward ID: ${ctx.tags['custom-reward-id']}`);
    // Change my opponent's rating
    if (ctx.tags['custom-reward-id'] === ENV.TWITCH_CR_OPP_RATING) {
      let rating: string | number = ctx.message;
      rating = parseInt(rating);
      if (isNaN(rating) || rating < 1 || rating > 9999) {
        return;
      }

      this.twitchGateway.sendDataToSockets('serverMessage', {
        type: 'OPP_RATING',
        rating,
        user: ctx.tags['display-name']
      });
    }

    // Add to the challenge queue
    if (ctx.tags['custom-reward-id'] === ENV.TWITCH_CR_CHALLENGE_QUEUE) {
      challengeQueue.push({
        twitchUser: ctx.tags['display-name'],
        lichessUser: ctx.message
      });
      ctx.botSpeak(`@${ctx.tags['display-name']} has joined the queue!`);
      void this.twitchService.ownerRunCommand(
        `!tts ${removeSymbols(ctx.tags['display-name'])} has joined the queue!`
      );
    }

    // Change BlunderBot's Personality
    if (ctx.tags['custom-reward-id'] === ENV.TWITCH_CR_BB_PERSONALITY) {
      void this.twitchService.ownerRunCommand(`!personality ${ctx.message}`);
    }

    // Buy a Square
    if (ctx.tags['custom-reward-id'] === ENV.TWITCH_CR_BUY_SQUARE) {
      const square = ctx.message.trim().substring(0, 2).toLowerCase();
      void this.twitchService.ownerRunCommand(
        `!buy ${square} ${ctx.tags['display-name']}`
      );
    }

    // Play a gif
    if (ctx.tags['custom-reward-id'] === ENV.TWITCH_CR_GIF) {
      void this.twitchService.ownerRunCommand(`!gif ${ctx.message}`);
    }

    // Title Me on Lichess
    if (ctx.tags['custom-reward-id'] === ENV.TWITCH_CR_LICHESS_TITLE) {
      void this.twitchService.ownerRunCommand(
        `!tts ${removeSymbols(
          ctx.tags['display-name']
        )} would like to be titled on lichess. They chose: ${ctx.message}`
      );
    }

    // Create an opp king
    if (ctx.tags['custom-reward-id'] === ENV.TWITCH_CR_OPP_KING) {
      void this.twitchService.ownerRunCommand(
        `!tts ${removeSymbols(
          ctx.tags['display-name']
        )} would like you to create them an opponent king. They chose: ${
          ctx.message
        }`
      );
    }

    // Guide the raid
    if (ctx.tags['custom-reward-id'] === ENV.TWITCH_CR_GUIDE_RAID) {
      void this.twitchService.ownerRunCommand(
        `!tts ${removeSymbols(
          ctx.tags['display-name']
        )} is guiding the raid to ${removeSymbols(ctx.message)}`
      );
    }

    // Change blunderbot's voice
    if (ctx.tags['custom-reward-id'] === ENV.TWITCH_CR_BB_VOICE) {
      void this.twitchService.ownerRunCommand(
        `!voice ${removeSymbols(ctx.message)}`
      );
    }

    // Run a poll
    if (ctx.tags['custom-reward-id'] === ENV.TWITCH_CR_RUN_POLL) {
      void this.twitchService.ownerRunCommand(
        `!poll ${removeSymbols(ctx.message)}`
      );
    }
  }

  getChallengeQueue() {
    return challengeQueue;
  }
}
