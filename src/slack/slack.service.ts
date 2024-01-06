import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { OpenaiService } from '../openai/openai.service';
import { WebClient } from '@slack/web-api';
import { SocketModeClient } from '@slack/socket-mode';
import { CONFIG } from '../config/config.service';

const appToken = CONFIG.slack.appToken;
const socketModeClient = new SocketModeClient({
  appToken
});

const client = new WebClient(CONFIG.slack.botToken);

@Injectable()
export class SlackService {
  private logger: Logger = new Logger(SlackService.name);

  constructor(
    @Inject(forwardRef(() => OpenaiService))
    private readonly openaiService: OpenaiService
  ) {
    if (!CONFIG.slack.enabled) {
      this.logger.log('Slack disabled');
      return;
    }
    socketModeClient.on('connecting', async () => {
      this.logger.log('Trying.........');
    });
    socketModeClient.on('authenticated', async () => {
      this.logger.log('Authenticated.........');
    });
    socketModeClient.on('connected', async () => {
      this.logger.log('Connected.........');
    });
    socketModeClient.on('ready', async () => {
      this.logger.log('Ready.........');
    });
    socketModeClient.on('disconnecting', async () => {
      this.logger.log('Disconnecting.........');
    });
    socketModeClient.on('unable_to_socket_mode_start', async () => {
      this.logger.log('Unable to socket mode start.........');
    });
    socketModeClient.on('error', async () => {
      this.logger.log('Error.........');
    });
    socketModeClient.on('slack_event', async (...args) => {
      this.logger.log(JSON.stringify(args));
    });

    socketModeClient.on('app_mention', async ({ event, ack }) => {
      await ack();
      const prompt = event.text.split('>')[1];

      // The slack service doesn't include the blunderbot context/system messages right now
      const reply = await this.openaiService.sendPrompt(prompt);
      await client.chat.postMessage({
        channel: event.channel,
        text: reply,
        mrkdwn: true
      });
    });

    try {
      (async () => {
        // Connect to Slack
        await socketModeClient.start();
      })();
    } catch (error) {
      this.logger.error('Problem starting slack client in Socket Mode');
      this.logger.error(error);
    }
  }
}
