export interface ConfigInterface {
  twitch: JSON;
  lichess: JSON;
  commandConfig: JSON;
  discord: JSON;
  openai: JSON;
  spotify: JSON;
  twitter: JSON;
  trivia: JSON;
  youtube: JSON;
  misc: JSON;
}

export interface ConfigCreateInput {
  twitch?: JSON;
  lichess?: JSON;
  commandConfig?: JSON;
  discord?: JSON;
  openai?: JSON;
  spotify?: JSON;
  twitter?: JSON;
  trivia?: JSON;
  youtube?: JSON;
  misc?: JSON;
}
