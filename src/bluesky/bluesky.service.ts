import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { AtpAgent } from '@atproto/api';
import { ConfigV2Service } from '../configV2/configV2.service';

@Injectable()
export class BlueskyService {
  private readonly logger: Logger = new Logger(BlueskyService.name);
  private client: AtpAgent;

  public constructor(
    @Inject(forwardRef(() => ConfigV2Service))
    private readonly configV2Service: WrapperType<ConfigV2Service>
  ) {}

  public async init(): Promise<void> {
    try {
      this.client = new AtpAgent({
        service: 'https://bsky.social'
      });

      await this.client.login({
        identifier: this.configV2Service.get().bluesky.username,
        password: this.configV2Service.get().bluesky.password
      });

      this.logger.log('Successfully connected to Bluesky');
    } catch (e) {
      this.logger.error('Failed to initialize Bluesky client:');
      this.logger.error(e);
    }
  }

  private async getClient(): Promise<AtpAgent> {
    if (!this.client) {
      await this.init();
    }
    return this.client;
  }

  public async postImage(imageBuffer: Buffer, text: string): Promise<void> {
    const client = await this.getClient();

    try {
      const response = await client.api.com.atproto.repo.uploadBlob(
        imageBuffer,
        {
          encoding: 'image/jpeg'
        }
      );

      await this.client.api.com.atproto.repo.createRecord({
        repo: this.client.session.did,
        collection: 'app.bsky.feed.post',
        record: {
          text,
          embed: {
            $type: 'app.bsky.embed.images',
            images: [{ image: response.data.blob, alt: text }]
          },
          createdAt: new Date().toISOString()
        }
      });

      this.logger.log(`Posted image to Bluesky: ${text}`);
    } catch (e) {
      this.logger.error('Failed to upload image to Bluesky.');
      this.logger.error(e);
    }
  }

  public async post(text: string): Promise<void> {
    const client = await this.getClient();

    try {
      text += ' ' + this.configV2Service.get().bluesky.hashtags || '';
      await client.com.atproto.repo.createRecord({
        repo: client.session.did,
        collection: 'app.bsky.feed.post',
        record: {
          text,
          createdAt: new Date().toISOString()
        }
      });
      this.logger.log(`Posted to Bluesky: ${text}`);
    } catch (e) {
      this.logger.error('Failed to post to Bluesky.');
      this.logger.error(e);
    }
  }
}
