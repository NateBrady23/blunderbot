type DiscordMessage = {
  content: string;
  channelId: string;
  author: {
    id: string;
    username: string;
  };
};
