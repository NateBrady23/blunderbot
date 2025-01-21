interface ConfigInterface {
  twitch: JSON;
  lichess: JSON;
  commandConfig: JSON;
  discord: JSON;
  openai: JSON;
  spotify: JSON;
  bluesky: JSON;
  trivia: JSON;
  youtube: JSON;
  misc: JSON;
}

interface ConfigCreateInput {
  twitch?: JSON;
  lichess?: JSON;
  commandConfig?: JSON;
  discord?: JSON;
  openai?: JSON;
  spotify?: JSON;
  bluesky?: JSON;
  trivia?: JSON;
  youtube?: JSON;
  misc?: JSON;
}
