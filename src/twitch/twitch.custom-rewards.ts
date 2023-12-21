import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CONFIG } from '../config/config.service';
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
    if (
      ctx.tags['custom-reward-id'] === CONFIG.twitch.customRewards.oppRating
    ) {
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
    if (
      ctx.tags['custom-reward-id'] ===
      CONFIG.twitch.customRewards.challengeQueue
    ) {
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
    if (
      ctx.tags['custom-reward-id'] === CONFIG.twitch.customRewards.bbPersonality
    ) {
      void this.twitchService.ownerRunCommand(`!personality ${ctx.message}`);
    }

    // Buy a Square
    if (
      ctx.tags['custom-reward-id'] === CONFIG.twitch.customRewards.buySquare
    ) {
      const square = ctx.message.trim().substring(0, 2).toLowerCase();
      void this.twitchService.ownerRunCommand(
        `!buy ${square} ${ctx.tags['display-name']}`
      );
    }

    // Play a gif
    if (ctx.tags['custom-reward-id'] === CONFIG.twitch.customRewards.gif) {
      void this.twitchService.ownerRunCommand(`!gif ${ctx.message}`);
    }

    // Title Me on Lichess
    if (
      ctx.tags['custom-reward-id'] === CONFIG.twitch.customRewards.lichessTitle
    ) {
      void this.twitchService.ownerRunCommand(
        `!tts ${removeSymbols(
          ctx.tags['display-name']
        )} would like to be titled on lichess. They chose: ${ctx.message}`
      );
    }

    // Create an opp king
    if (ctx.tags['custom-reward-id'] === CONFIG.twitch.customRewards.oppKing) {
      void this.twitchService.ownerRunCommand(
        `!tts ${removeSymbols(
          ctx.tags['display-name']
        )} would like you to create them an opponent king. They chose: ${
          ctx.message
        }`
      );
    }

    // Create my own command
    if (
      ctx.tags['custom-reward-id'] === CONFIG.twitch.customRewards.myOwnCommand
    ) {
      void this.twitchService.ownerRunCommand(
        `!tts ${removeSymbols(
          ctx.tags['display-name']
        )} wants their own command! They chose: ${ctx.message}`
      );
    }

    // Guide the raid
    if (
      ctx.tags['custom-reward-id'] === CONFIG.twitch.customRewards.guideRaid
    ) {
      void this.twitchService.ownerRunCommand(
        `!tts ${removeSymbols(
          ctx.tags['display-name']
        )} is guiding the raid to ${removeSymbols(ctx.message)}`
      );
    }

    // Change blunderbot's voice
    if (ctx.tags['custom-reward-id'] === CONFIG.twitch.customRewards.bbVoice) {
      void this.twitchService.ownerRunCommand(
        `!voice ${removeSymbols(ctx.message)}`
      );
    }

    // Run a poll
    if (ctx.tags['custom-reward-id'] === CONFIG.twitch.customRewards.runPoll) {
      void this.twitchService.ownerRunCommand(
        `!poll ${removeSymbols(ctx.message)}`
      );
    }
  }

  getChallengeQueue() {
    return challengeQueue;
  }
}
