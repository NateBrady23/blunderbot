import { Message } from 'discord.js';

declare global {
  interface Context {
    // Twitch or Discord client
    client?: unknown;
    // Discord guild
    guild?: unknown;
    // twitch channel
    channel?: string;
    // the entire message including any commands
    message: string;
    // the discord message object
    discordMessage?: DiscordMessage;
    // just the args for the command
    args?: string[];
    // just the command
    command?: string;
    // just the body of the message without the command
    body?: string;
    botSpeak?: (string) => Promise<void> | Promise<Message<true>>;
    reply?: (Context, string) => void;
    platform: Platforms;
    isOwnerRun?: boolean;
    onBehalfOf?: string;

    // always lowercase display name
    username: string;
    // Cased however the user entered their display name
    displayName: string;
    // This property will only exist if a twitch reward was redeemed
    customRewardId: string;
    // Currently being used to mention players in discord
    userId?: string;

    isOwner: boolean;
    isMod: boolean;
    isBot: boolean;

    // Twitch only
    isSubscriber?: boolean;
    isFollower?: boolean;
    isVip?: boolean;
    isHypeTrainConductor?: boolean;
    isFounder?: boolean;
  }

  type Platforms = 'twitch' | 'discord';

  interface CreateContextOptions {
    onBehalfOf?: string;
  }

  interface CommandRequest {
    command: DiscordMessage;
  }

  interface TranslationRequest {
    message: string;
  }
}
