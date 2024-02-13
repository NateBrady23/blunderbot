import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigEntityService } from '../models/config/config.service';
import { Config } from '../models/config/config.entity';
import { TwitchPubSub } from '../twitch/twitch.pubsub';
import { TwitchEventSub } from '../twitch/twitch.eventsub';
import { CommandService } from '../command/command.service';
import { DiscordService } from '../discord/discord.service';
import { OpenaiService } from '../openai/openai.service';

@Injectable()
export class ConfigV2Service {
  private logger: Logger = new Logger(ConfigV2Service.name);
  private config: Config;

  constructor(
    @Inject(forwardRef(() => CommandService))
    private readonly commandService: CommandService,
    @Inject(forwardRef(() => ConfigEntityService))
    private readonly configEntityService: ConfigEntityService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
    @Inject(forwardRef(() => OpenaiService))
    private readonly openaiService: OpenaiService,
    @Inject(forwardRef(() => TwitchEventSub))
    private readonly twitchEventSub: TwitchEventSub,
    @Inject(forwardRef(() => TwitchPubSub))
    private readonly twitchPubSub: TwitchPubSub
  ) {
    this.get = this.get.bind(this);
    void this.init();
  }

  async init() {
    this.logger.log('ConfigV2Service instantiated');
    this.config = await this.getLatest();

    if (this.config.twitch) {
      this.twitchPubSub.init();
      this.twitchEventSub.init();

      this.commandService.init();
    } else {
      this.logger.error(
        'Twitch config not found. Head over to BlunderBot Admin to set it up.'
      );
      return;
    }

    if (this.config.discord) {
      this.discordService.init();
    }

    if (this.config.openai) {
      this.openaiService.init();
    }
  }

  async getLatest(): Promise<Config> {
    this.config = ((await this.configEntityService.latest()) || {}) as Config;
    return this.config;
  }

  async update(key: ConfigV2Keys, value: any): Promise<Partial<ConfigV2>> {
    const config = await this.getLatest();
    // Always create a new config object to avoid updating the same object in the database
    // allowing for possible config rollback
    config.id = undefined;
    config[key] = value;
    return (await this.configEntityService.create(
      config
    )) as unknown as Partial<ConfigV2>;
  }

  get(): Partial<ConfigV2> {
    return { ...this.config } as unknown as Partial<ConfigV2>;
  }
}
