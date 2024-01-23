import { Injectable, Logger } from '@nestjs/common';
import { CONFIG } from '../config/config.service';
import { EUploadMimeType, TwitterApi } from 'twitter-api-v2';

@Injectable()
export class TwitterService {
  private logger: Logger = new Logger(TwitterService.name);

  private client;

  constructor() {
    if (CONFIG.get().twitter.enabled) {
      this.client = new TwitterApi({
        appKey: CONFIG.get().twitter.apiKey,
        appSecret: CONFIG.get().twitter.apiSecret,
        accessToken: CONFIG.get().twitter.accessToken,
        accessSecret: CONFIG.get().twitter.accessSecret
      });
    }
  }

  async postImage(imageBuffer: Buffer, text: string) {
    try {
      const mediaId = await this.client.v1.uploadMedia(imageBuffer, {
        mimeType: EUploadMimeType.Png
      });
      await this.client.v2.tweet(text, { media: { media_ids: [mediaId] } });
      this.logger.log(`Posted image to Twitter: ${text}`);
    } catch (e) {
      this.logger.error('Failed to upload image to Twitter.');
      this.logger.error(e);
    }
  }

  async postTweet(text: string) {
    try {
      await this.client.v2.tweet(text);
      this.logger.log(`Posted tweet to Twitter: ${text}`);
    } catch (e) {
      this.logger.error('Failed to post tweet to Twitter.');
      this.logger.error(e);
    }
  }
}
