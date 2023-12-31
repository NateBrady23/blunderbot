import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CommandService } from '../command/command.service';
import { Platform } from '../enums';
import { CONFIG } from '../config/config.service';

const { AttachmentBuilder, Client, GatewayIntentBits } = require('discord.js');

@Injectable()
export class DiscordService {
  private logger: Logger = new Logger(DiscordService.name);

  public client;
  public guild;

  constructor(
    @Inject(forwardRef(() => CommandService))
    private readonly commandService: CommandService
  ) {
    if (!CONFIG.discord.enabled) {
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
            this.logger.log(totalOnline.get(id).user.username);
          }
          // Now you have a collection with all online member objects in the totalOnline variable
          this.logger.log(
            `There are currently ${totalOnline.size} members online in this guild!`
          );
        });
    });

    this.client.login(CONFIG.discord.botToken);
    this.client.on('messageCreate', this.onMessageHandler.bind(this));
  }

  makeAnnouncement(content) {
    const channel = this.client.channels.cache.get(
      CONFIG.discord.announcementChannelId
    );
    channel.send(content);
  }

  postImageToGallery(content: string, buffer: Buffer) {
    try {
      const channel = this.client.channels.cache.get(
        CONFIG.discord.galleryChannelId
      );
      const attachment = new AttachmentBuilder(buffer, 'image.png');
      channel.send({ content, files: [attachment] });
    } catch (error) {
      this.logger.error(error);
    }
  }

  botSpeak(discordMessage: DiscordMessage | { channelId }, message: string) {
    const channel = this.client.channels.cache.get(discordMessage.channelId);
    channel.send(message);
  }

  // TODO: There's a bug sometimes where there's no message or context?
  onMessageHandler(discordMessage) {
    const botAuthorId = CONFIG.discord.botAuthorId;
    if (!discordMessage) return;
    // Checks to see if BlunderBot was mentioned at the beginning or
    // end of the message, so it can respond.
    const beginEndMentionRegex = new RegExp(
      `^<@${botAuthorId}>|<@${botAuthorId}>.?.?$`,
      'i'
    );

    if (beginEndMentionRegex.test(discordMessage.content)) {
      discordMessage.content = '!chat ' + discordMessage.content;
      const blunderBotMentionRegex = new RegExp(`<@${botAuthorId}>`, 'gi');
      discordMessage.content = discordMessage.content.replace(
        blunderBotMentionRegex,
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
      .filter((e) => e !== '');
    const command = args.shift();

    context.body = context.message.replace(`!${command}`, '').trim();
    context.args = args;
    context.command = command.toLowerCase();

    context.tags = {
      username: discordMessage.author.username,
      'display-name': discordMessage.author.username,
      userId: discordMessage.author.id,
      owner: discordMessage.author.id === CONFIG.discord.ownerAuthorId,
      // We determine a mod by seeing if they're in the mod channel
      mod:
        discordMessage.author.id === CONFIG.discord.ownerAuthorId ||
        discordMessage.channelId === CONFIG.discord.modChannelId,
      // Unused atm - Just the owner is marked as a subscriber
      subscriber: discordMessage.author.id === CONFIG.discord.ownerAuthorId
    };

    return context;
  }
}
