import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CommandService } from '../command/command.service';
import { Platform } from '../enums';
import {
  AttachmentBuilder,
  Client,
  GatewayIntentBits,
  Guild,
  Message,
  TextChannel
} from 'discord.js';
import { ConfigV2Service } from '../configV2/configV2.service';

@Injectable()
export class DiscordService {
  private readonly logger: Logger = new Logger(DiscordService.name);

  public client: Client;
  public guild: Guild;

  public constructor(
    @Inject(forwardRef(() => CommandService))
    private readonly commandService: WrapperType<CommandService>,
    @Inject(forwardRef(() => ConfigV2Service))
    private readonly configV2Service: WrapperType<ConfigV2Service>
  ) {}

  public init(): void {
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

      this.guild = this.client.guilds.cache.first();
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

    void this.client.login(this.configV2Service.get().discord.botToken);
    this.client.on('messageCreate', this.onMessageHandler.bind(this));
  }

  private async sendToTextChannel(
    channel: TextChannel,
    content: string
  ): Promise<Message> {
    // trim because discord has a 4000 character limit
    if (content.length > 4000) {
      content = content.slice(0, 4000);
    }
    if (channel) {
      return channel.send(content);
    }
  }

  public makeAnnouncement(content: string): Promise<Message> {
    const channel = this.client.channels.cache.get(
      this.configV2Service.get().discord.announcementChannelId
    ) as TextChannel;
    return this.sendToTextChannel(channel, content);
  }

  public postImageToGallery(content: string, buffer: Buffer): void {
    try {
      const channel = this.client.channels.cache.get(
        this.configV2Service.get().discord.galleryChannelId
      ) as TextChannel;
      const attachment = new AttachmentBuilder(buffer, {
        name: 'image.png'
      });
      void channel.send({ content, files: [attachment] });
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async botSpeak(
    discordMessage: DiscordMessage | { channelId: string },
    message: string
  ): Promise<Message> {
    const channel = this.client.channels.cache.get(
      discordMessage.channelId
    ) as TextChannel;
    if (channel) {
      return await this.sendToTextChannel(channel, message);
    } else {
      this.logger.error(`Channel not found: ${discordMessage.channelId}`);
    }
  }

  // TODO: There's a bug sometimes where there's no message or context?
  public onMessageHandler(discordMessage: Message): void {
    const botAuthorId = this.configV2Service.get().discord.botAuthorId;
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

  public ownerRunCommand(discordMessage: DiscordMessage): void {
    const context = this.createContext(discordMessage);
    void this.commandService.run(context);
  }

  public createContext(discordMessage: DiscordMessage): Context | undefined {
    const message = discordMessage.content;
    const context: Partial<Context> = {
      client: this.client,
      guild: this.guild,
      message,
      discordMessage,
      reply: (ctx, message) =>
        void this.botSpeak(discordMessage, `<@${ctx.userId}> ${message}`),
      botSpeak: (message: string) =>
        this.botSpeak(discordMessage, message) as Promise<Message<true>>,
      platform: Platform.Discord
    };

    // The message isn't a command, so we're done.
    if (!CommandService.isCommandFormat(message)) return;

    const args = message
      .slice(1)
      .split(' ')
      .filter((e) => e !== '');

    if (args.length && args[0].length) {
      const command = args.shift();
      context.body = context.message.replace(`!${command}`, '').trim();
      context.args = args;
      context.command = command.toLowerCase();
    }

    context.username = discordMessage.author.username.toLowerCase();
    context.displayName = discordMessage.author.username;
    context.userId = discordMessage.author.id;
    context.isOwner =
      discordMessage.author.id ===
      this.configV2Service.get().discord.ownerAuthorId;
    context.isBot =
      discordMessage.author.id ===
      this.configV2Service.get().discord.botAuthorId;
    // We determine a mod by seeing if they're in the mod channel
    context.isMod =
      context.isOwner ||
      discordMessage.channelId ===
        this.configV2Service.get().discord.modChannelId;
    context.isSubscriber = context.isOwner;
    return <Context>context;
  }
}
