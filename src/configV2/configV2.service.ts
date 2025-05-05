import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigEntityService } from '../models/config/config.service';
import { TwitchEventSub } from '../twitch/twitch.eventsub';
import { CommandService } from '../command/command.service';
import { DiscordService } from '../discord/discord.service';
import { OpenaiService } from '../openai/openai.service';
import { TwitchService } from '../twitch/twitch.service';
import { readdirSync } from 'fs';
import { Platform } from '../enums';
import { removeSymbols } from '../utils/utils';
import { BrowserService } from '../browser/browser.service';
import { Config } from 'src/models/config/config.entity';

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
            command = command.replace(/{message}/g, ctx.body || '');
            void services.twitchService.ownerRunCommand(command, {
              onBehalfOf: ctx.displayName
            });
          }
        });
      }
      if (obj.message) {
        let msg = obj.message.replace(
          /{username}/g,
          removeSymbols(ctx.displayName)
        );
        msg = msg.replace(/{message}/g, ctx.body || '');
        ctx.botSpeak(msg);
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
  private readonly logger: Logger = new Logger(ConfigV2Service.name);

  public constructor(
    @Inject(forwardRef(() => BrowserService))
    private readonly browserService: WrapperType<BrowserService>,
    @Inject(forwardRef(() => CommandService))
    private readonly commandService: WrapperType<CommandService>,
    @Inject(forwardRef(() => ConfigEntityService))
    private readonly configEntityService: WrapperType<ConfigEntityService>,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: WrapperType<DiscordService>,
    @Inject(forwardRef(() => OpenaiService))
    private readonly openaiService: WrapperType<OpenaiService>,
    @Inject(forwardRef(() => TwitchEventSub))
    private readonly twitchEventSub: WrapperType<TwitchEventSub>,
    @Inject(forwardRef(() => TwitchService))
    private readonly twitchService: WrapperType<TwitchService>
  ) {
    this.get = this.get.bind(this);
    void this.init();
  }

  public async init(): Promise<void> {
    this.logger.log('ConfigV2Service instantiated');
    config = (await this.getLatest()) as unknown as ConfigV2;

    if (config.twitch) {
      this.commandService.init();

      this.twitchService.init();
      this.twitchEventSub.init();
    }

    if (config.discord.enabled) {
      this.discordService.init();
    }

    if (config.openai.enabled) {
      this.openaiService.init();
    }

    this.browserService.init();
  }

  private loadCommands(): void {
    const messageCommands: Record<string, Command> = {};
    const messageCommandsConfig = config.commandConfig.simpleCommands || {};
    Object.keys(messageCommandsConfig).forEach((key) => {
      messageCommands[key] = getCommandProperties(
        messageCommandsConfig[key] as MessageCommand,
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
          // eslint-disable-next-line @typescript-eslint/no-require-imports
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

  public async getLatest(): Promise<ConfigV2> {
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
    ].forEach((publicFiles) => {
      const [dir, fileList] = publicFiles as [string, string[]];
      readdirSync(dir).forEach((file) => {
        const fileName = file.split('.')[0];
        if (fileName) {
          fileList.push(file);
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
              (config.themeConfig[theme][dir] as { [key: string]: true })[
                fileName
              ] = true;
            }
          );
        }
      });
    });

    this.loadCommands();
    console.log('ConfigV2 loaded');

    return config;
  }

  public async update(
    key: ConfigV2Keys,
    value: JSON & number & Date
  ): Promise<ConfigV2> {
    let newConfig: Config | null = await this.configEntityService.latest();
    // Always create a new config object to avoid updating the same object in the database
    // allowing for possible config rollback
    if (newConfig) {
      (newConfig as Partial<Config>).id = null as unknown as number;
      newConfig[key as keyof Config] = value;
    } else {
      newConfig = { [key]: value } as unknown as Config;
    }
    await this.configEntityService.create(newConfig);
    config = await this.getLatest();
    return config;
  }

  public get(): Partial<ConfigV2> {
    return config as unknown as Partial<ConfigV2>;
  }
}
