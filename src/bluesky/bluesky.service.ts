import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { AtpAgent } from '@atproto/api';
import { ConfigV2Service } from '../configV2/configV2.service';

@Injectable()
export class BlueskyService {
  private logger: Logger = new Logger(BlueskyService.name);

  private client: AtpAgent;

  constructor(
    @Inject(forwardRef(() => ConfigV2Service))
    private readonly configV2Service: ConfigV2Service
  ) {}

  init() {
    this.client = new AtpAgent({
      service: 'https://bsky.social'
    });
    this.client.login({
      identifier: this.configV2Service.get().bluesky.username,
      password: this.configV2Service.get().bluesky.password
    });
  }

  async postImage(imageBuffer: Buffer, text: string) {
    try {
      const response = await this.client.api.com.atproto.repo.uploadBlob(
        imageBuffer,
        {
          encoding: 'image/jpeg'
        }
      );

      await this.client.api.com.atproto.repo.createRecord({
        repo: this.client.session?.did,
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

  async post(text: string) {
    try {
      text += ' ' + this.configV2Service.get().bluesky.hashtags || '';
      await this.client.com.atproto.repo.createRecord({
        repo: this.client.session?.did,
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
