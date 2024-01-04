interface YAMLConfig {
  port: number;
  nickname: string;
  commandsListUrl: string;

  twitch: {
    ownerUsername: string;
    channel: string;
    ownerId: string;
    botId: string;
    botUsername: string;
    botPassword: string;
    apiBotOauthToken: string;
    apiOwnerOauthToken: string;
    apiClientId: string;
    apiClientSecret: string;
    customRewards: {
      oppRating: string;
      challengeQueue: string;
      bbPersonality: string;
      buySquare: string;
      gif: string;
      lichessTitle: string;
      oppKing: string;
      guideRaid: string;
      bbVoice: string;
      runPoll: string;
      myOwnCommand: string;
    };
    followerCommands: string[];
    subCommands: string[];
    limitedCommands: { [key: string]: number };
    userRestrictedCommands: {
      [key: string]: string[];
    };
  };

  lichess: {
    user: string;
    oauthToken: string;
    botOauthToken: string;
    teamId: string;
    teamName: string;
  };

  openai: {
    apiKey: string;
    chatModel: string;
    imageModel: string;
    ttsModel: string;
    textModerationModel: string;
    baseSystemMessage: string;
    imageEdits: string[];
    voices: string[];
    pronunciations: [[string, string]];
  };

  twitter: {
    enabled: boolean;
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessSecret: string;
    tweetImagesEnabled: boolean;
    tweetHashtags: string;
    announceLive: boolean;
  };

  discord: {
    enabled: boolean;
    botToken: string;
    announcementChannelId: string;
    galleryChannelId: string;
    generalChannelId: string;
    modChannelId: string;
    ownerAuthorId: string;
    botAuthorId: string;
    inviteLink: string;
  };

  slack: {
    enabled: boolean;
    appToken: string;
    botToken: string;
  };

  decapi: {
    enabled: boolean;
    token: string;
  };

  heartRate: {
    enabled: boolean;
    url: string;
    class: string;
  };

  giphy: {
    enabled: boolean;
    apiKey: string;
  };

  rapidApi: {
    enabled: boolean;
    keys: string[];
  };

  youtube: {
    enabled: boolean;
    apiKey: string;
    shortsPlaylistId: string;
  };

  welcome: {
    enabled: boolean;
    message: string;
    ignoreUsers: string[];
  };

  sounds: {
    mute: {
      programs: string[];
    };
  };

  autoShoutouts: string[];
  titledPlayers: [string[]];

  autoCommands: [
    {
      commands: string[];
    }
  ];

  killedCommands: string[];
  hiddenCommands: string[];
  messageCommands: MessageCommand[];

  raids: {
    alert: string;
    announcement: string;
    defaultCommands: string[];
    matches: {
      [key: string]: {
        commands: string[];
        alert: string;
      };
    };
  };

  bits: {
    matches: {
      [key: string]: {
        commands: string[];
        alert: string;
      };
    };
    '100orMore': {
      commands: string[];
      alert: string;
    };
    '99orLess': {
      commands: string[];
      alert: string;
    };
  };

  gif: {
    matches: {
      [key: string]: string;
    };
    notFound: string;
  };

  autoResponder: {
    phrases: string[];
    responses: string[];
  }[];
}
