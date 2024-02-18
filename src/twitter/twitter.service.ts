import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { EUploadMimeType, TwitterApi } from 'twitter-api-v2';
import { ConfigV2Service } from '../configV2/configV2.service';

@Injectable()
export class TwitterService {
  private logger: Logger = new Logger(TwitterService.name);

  private client: TwitterApi;

  constructor(
    @Inject(forwardRef(() => ConfigV2Service))
    private readonly configV2Service: ConfigV2Service
  ) {}

  init() {
    this.client = new TwitterApi({
      appKey: this.configV2Service.get().twitter.apiKey,
      appSecret: this.configV2Service.get().twitter.apiSecret,
      accessToken: this.configV2Service.get().twitter.accessToken,
      accessSecret: this.configV2Service.get().twitter.accessSecret
    });
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
      text += ' ' + this.configV2Service.get().twitter.tweetHashtags || '';
      await this.client.v2.tweet(text);
      this.logger.log(`Posted tweet to Twitter: ${text}`);
    } catch (e) {
      this.logger.error('Failed to post tweet to Twitter.');
      this.logger.error(e);
    }
  }
}
