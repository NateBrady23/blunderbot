import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigEntityService } from '../models/config/config.service';
import { TwitchPubSub } from '../twitch/twitch.pubsub';
import { TwitchEventSub } from '../twitch/twitch.eventsub';
import { CommandService } from '../command/command.service';
import { DiscordService } from '../discord/discord.service';
import { OpenaiService } from '../openai/openai.service';
import { TwitchService } from '../twitch/twitch.service';
import { readdirSync } from 'fs';
import { Platform } from '../enums';
import { removeSymbols } from '../utils/utils';
import { TwitterService } from '../twitter/twitter.service';
import { BrowserService } from '../browser/browser.service';

function getCommandProperties(obj: MessageCommand, name: string): Command {
  return {
    name,
    ownerOnly: obj.ownerOnly,
    aliases: obj.aliases,
    platforms: obj.platforms || [Platform.Twitch, Platform.Discord],
    run: (ctx: Context, { services }) => {
      if (obj.commands) {
        obj.commands.forEach((command: string) => {
          if (ctx.platform === Platform.Twitch) {
            command = command.replace(
              /{username}/g,
              removeSymbols(ctx.displayName)
            );
            void services.twitchService.ownerRunCommand(command, {
              onBehalfOf: ctx.displayName
            });
          }
        });
      }
      if (obj.message) {
        ctx.botSpeak(obj.message);
      }
      return true;
    },
    coolDown: 2000
  };
}

// Because of the circular dependencies and forwardRef, we need to use a variable to store the config
// outside of the class.
let config: ConfigV2;

@Injectable()
export class ConfigV2Service {
  private logger: Logger = new Logger(ConfigV2Service.name);

  constructor(
    @Inject(forwardRef(() => BrowserService))
    private readonly browserService: BrowserService,
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
    private readonly twitchPubSub: TwitchPubSub,
    @Inject(forwardRef(() => TwitchService))
    private readonly twitchService: TwitchService,
    @Inject(forwardRef(() => TwitterService))
    private readonly twitterService: TwitterService
  ) {
    this.get = this.get.bind(this);
    void this.init();
  }

  async init() {
    this.logger.log('ConfigV2Service instantiated');
    config = (await this.getLatest()) as unknown as ConfigV2;

    if (config.twitch) {
      this.commandService.init();

      this.twitchService.init();
      this.twitchPubSub.init();
      this.twitchEventSub.init();
    }

    if (config.discord?.enabled) {
      this.discordService.init();
    }

    if (config.openai?.enabled) {
      this.openaiService.init();
    }

    if (config.twitter?.enabled) {
      this.twitterService.init();
    }

    this.browserService.init();
  }

  private loadCommands() {
    const messageCommands: Record<string, Command> = {};
    const messageCommandsConfig = config.commandConfig?.simpleCommands || {};
    Object.keys(messageCommandsConfig).forEach((key) => {
      messageCommands[key] = getCommandProperties(
        messageCommandsConfig[key],
        key
      );
    });

    config.commands = {
      ...messageCommands
    };

    const dirImports = [
      ['./src/command/commands', '../command/commands/'],
      ['./src/command/mod-commands', '../command/mod-commands/'],
      ['./src/command/owner-commands', '../command/owner-commands/'],
      // Include any overrides commands
      ['./src/command-overrides/commands', '../command-overrides/commands/'],
      [
        './src/command-overrides/mod-commands',
        '../command-overrides/mod-commands/'
      ],
      [
        './src/command-overrides/owner-commands',
        '../command-overrides/owner-commands/'
      ]
    ];

    //
    dirImports.forEach((dir) => {
      readdirSync(dir[0]).forEach((file) => {
        const fileName = file.split('.')[0];
        if (!file.startsWith('.')) {
          config.commands[fileName] = require(`${dir[1]}${fileName}`).default;
          if (dir[0].includes('mod-commands')) {
            config.commands[fileName].modOnly = true;
          } else if (dir[0].includes('owner-commands')) {
            config.commands[fileName].ownerOnly = true;
          }
        }
      });
    });
  }

  async getLatest(): Promise<ConfigV2> {
    config = (await this.configEntityService.latest()) as unknown as ConfigV2;
    if (!config) {
      config = {} as ConfigV2;
    }

    config.kings = [];
    config.crowns = [];
    config.oppKings = [];
    config.soundboard = [];
    config.cursors = [];
    config.gifs = [];
    [
      ['./public/images/kings', config.kings],
      ['./public/images/crowns', config.crowns],
      ['./public/images/opponents', config.oppKings],
      ['./public/sounds/soundboard', config.soundboard],
      ['./public/images/cursors', config.cursors],
      ['./public/gifs', config.gifs]
    ].forEach((publicFiles: [string, string[]]) => {
      readdirSync(publicFiles[0]).forEach((file) => {
        const fileName = file.split('.')[0];
        if (fileName) {
          publicFiles[1].push(file);
        }
      });
    });

    config.themeConfig = {};
    readdirSync('./public/images/themes').forEach((theme) => {
      config.themeConfig[theme] = {};

      readdirSync(`./public/images/themes/${theme}`).forEach((dir) => {
        if (dir === 'board.png') {
          config.themeConfig[theme].boardExists = true;
        } else {
          config.themeConfig[theme][dir] = {};
          readdirSync(`./public/images/themes/${theme}/${dir}`).forEach(
            (file) => {
              const fileName = file.split('.')[0];
              config.themeConfig[theme][dir][fileName] = true;
            }
          );
        }
      });
    });

    this.loadCommands();
    console.log('ConfigV2 loaded');

    return config;
  }

  async update(key: ConfigV2Keys, value: any): Promise<ConfigV2> {
    let newConfig: any = await this.configEntityService.latest();
    // Always create a new config object to avoid updating the same object in the database
    // allowing for possible config rollback
    if (newConfig) {
      newConfig.id = undefined;
      newConfig[key] = value;
    } else {
      newConfig = { [key]: value };
    }
    await this.configEntityService.create(newConfig);
    config = await this.getLatest();
    return config;
  }

  get(): Partial<ConfigV2> {
    return config as unknown as Partial<ConfigV2>;
  }
}
