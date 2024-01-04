interface ContextTags {
  // always lowercase display name
  username: string;
  // added by me
  owner: boolean;
  mod: boolean;
  // Cased however the user entered their display name
  'display-name': string;
  // This property will only exist if a twitch reward was redeemed
  'custom-reward-id'?: string;
  // Currently being used to mention players in discord
  userId?: string;
  subscriber: boolean;
  follower?: boolean;
}

interface Context {
  // Twitch or Discord client
  client: unknown;
  // Discord guild
  guild?: unknown;
  // twitch channel
  channel?: string;
  // tags coming from tmi
  tags?: ContextTags;
  // the entire message
  message: string;
  // the discord message object
  discordMessage?: DiscordMessage;
  // just the args for the command
  args?: string[];
  // just the command
  command?: string;
  // just the body of the message without the command
  body?: string;
  botSpeak?: (string) => void;
  reply?: (Context, string) => void;
  platform: Platforms;
}

type Platforms = 'twitch' | 'discord';
