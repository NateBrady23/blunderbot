import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { TwitchService } from './twitch.service';
import { writeLog } from '../utils/logs';
import * as WebSocket from 'ws';
import { ConfigV2Service } from '../configV2/configV2.service';

@Injectable()
export class TwitchPubSub {
  private logger: Logger = new Logger(TwitchPubSub.name);
  private redemptionIds: string[] = [];
  private pubSubConnection: WebSocket;
  private pubSubPingInterval: NodeJS.Timeout;

  constructor(
    @Inject(forwardRef(() => TwitchService))
    private readonly twitchService: TwitchService,
    @Inject(forwardRef(() => ConfigV2Service))
    private readonly configV2Service: ConfigV2Service
  ) {}

  init() {
    this.pubSubCreateConnection();
  }

  pubSubCreateConnection() {
    this.pubSubConnection = new WebSocket('wss://pubsub-edge.twitch.tv');
    this.pubSubConnection.onopen = () => {
      this.logger.log('PubSub connection opened');
      this.pubSubConnection.send(
        JSON.stringify({
          type: 'LISTEN',
          data: {
            topics: [
              `channel-points-channel-v1.${this.configV2Service.get().twitch.ownerId}`,
              `channel-subscribe-events-v1.${this.configV2Service.get().twitch.ownerId}`,
              `channel-bits-badge-unlocks.${this.configV2Service.get().twitch.ownerId}`,
              `channel-bits-events-v2.${this.configV2Service.get().twitch.ownerId}`
            ],
            auth_token: this.configV2Service.get().twitch.apiOwnerOauthToken
          }
        })
      );

      clearInterval(this.pubSubPingInterval);
      this.pubSubPingInterval = setInterval(
        () => {
          this.pubSubConnection.send(JSON.stringify({ type: 'PING' }));
        },
        4 * 60 * 1000
      );
    };

    this.pubSubConnection.onmessage = this.pubSubMessageHandler.bind(this);
  }

  async pubSubMessageHandler(data: { data: string }) {
    const event = JSON.parse(data.data);

    if (event.type === 'AUTH_REVOKED' || event.type === 'RECONNECT') {
      this.logger.error(
        `PubSub connection closed: ${event.type}. Reconnecting...`
      );
      this.pubSubConnection.close();
      this.pubSubCreateConnection();
      return;
    }

    if (event.type === 'PONG') {
      return;
    }

    void writeLog('pubsub', event, { excludeDate: true });

    if (event.type === 'MESSAGE') {
      const message = JSON.parse(event.data.message);
      console.log(message);

      if (message.type === 'reward-redeemed') {
        // Prevent duplicate redemption events from twitch and replay attacks
        const redemptionId = message.data.redemption.id;
        if (this.redemptionIds.includes(redemptionId)) {
          return;
        } else {
          this.redemptionIds.push(redemptionId);
        }

        const username = message.data.redemption.user.display_name;
        const userInput = message.data.redemption.user_input;
        const reward = message.data.redemption.reward;

        this.logger.log(`User ${username} redeemed ${reward.title}`);

        if (
          this.configV2Service.get().twitch.customRewardCommands[reward.title]
        ) {
          for (let command of this.configV2Service.get().twitch
            .customRewardCommands[reward.title]) {
            command = command.replace(/{username}/gi, `${username}`);
            command = command.replace(/{message}/gi, `${userInput}`);
            void this.twitchService.ownerRunCommand(`${command}`, {
              onBehalfOf: username
            });
          }
        }
      }
    }
  }
}
