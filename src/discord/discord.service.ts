import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ENV } from '../config/config.service';
import { CommandService } from '../command/command.service';
import { Platform } from '../enums';

const { Client, GatewayIntentBits } = require('discord.js');

@Injectable()
export class DiscordService {
  private logger: Logger = new Logger('DiscordService');

  public client;
  public guild;

  constructor(
    @Inject(forwardRef(() => CommandService))
    private readonly commandService: CommandService
  ) {
    if (!ENV.DISCORD_ENABLED) {
      this.logger.log('Discord disabled');
      return;
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ]
    });

    this.client.on('ready', async () => {
      this.logger.log('Discord bot ready');

      this.guild = this.client.guilds.cache.map((guild) => guild)[0];
      this.guild.members
        .fetch({ withPresences: true })

        .then((fetchedMembers) => {
          const totalOnline = fetchedMembers.filter(
            (member) => member.presence?.status === 'online'
          );
          for (const id of totalOnline.keys()) {
            // console.log(id);
            console.log(totalOnline.get(id).user.username);
          }
          // Now you have a collection with all online member objects in the totalOnline variable
          console.log(
            `There are currently ${totalOnline.size} members online in this guild!`
          );
        });
    });

    this.client.login(ENV.DISCORD_BOT_TOKEN);
    this.client.on('messageCreate', this.onMessageHandler.bind(this));
  }

  makeAnnouncement(content) {
    const channel = this.client.channels.cache.get(
      ENV.DISCORD_ANNOUNCEMENT_CHANNEL
    );
    channel.send(content);
  }

  botSpeak(discordMessage: DiscordMessage | { channelId }, message: string) {
    const channel = this.client.channels.cache.get(discordMessage.channelId);
    channel.send(message);
  }

  // TODO: There's a bug sometimes where there's no message or context?
  onMessageHandler(discordMessage) {
    if (!discordMessage) return;
    if (
      discordMessage.content.match(
        /^<@1067564139251249162>|<@1067564139251249162>.?.?$/i
      )
    ) {
      discordMessage.content = '!chat ' + discordMessage.content;
      discordMessage.content = discordMessage.content.replace(
        /<@1067564139251249162>/gi,
        ''
      );
    }

    const context = this.createContext(discordMessage);
    if (!context) return;
    void this.commandService.run(context);
  }

  ownerRunCommand(discordMessage: DiscordMessage) {
    const context = this.createContext(discordMessage);
    void this.commandService.run(context);
  }

  createContext(discordMessage: DiscordMessage) {
    const message = discordMessage.content;
    const context: Context = {
      client: this.client,
      guild: this.guild,
      message,
      discordMessage,
      botSpeak: (message: string) => this.botSpeak(discordMessage, message),
      platform: Platform.Discord
    };

    // The message isn't a command, so we're done.
    if (!message.startsWith('!')) return;

    const args = message
      .slice(1)
      .split(' ')
      .filter((e) => e !== ' ');
    const command = args.shift();

    context.body = context.message.replace(`!${command}`, '').trim();
    context.args = args;
    context.command = command.toLowerCase();

    context.tags = {
      username: discordMessage.author.username,
      'display-name': discordMessage.author.username,
      userId: discordMessage.author.id,
      owner: discordMessage.author.id === ENV.DISCORD_OWNER_AUTHOR_ID,
      // We determine a mod by seeing if they're in the mod channel
      mod:
        discordMessage.author.id === ENV.DISCORD_OWNER_AUTHOR_ID ||
        discordMessage.channelId === ENV.DISCORD_MOD_CHANNEL,
      // Unused atm - Just the owner is marked as a subscriber
      subscriber: discordMessage.author.id === ENV.DISCORD_OWNER_AUTHOR_ID
    };

    return context;
  }
}
