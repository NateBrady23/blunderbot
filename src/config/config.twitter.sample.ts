/**
 * Not required
 */
const userTwitterConfig: UserTwitterConfig = {
  enabled: true,
  apiKey: 'your-key',
  apiSecret: 'and-secret',
  accessToken: 'access-token',
  accessSecret: 'access-secret',
  tweetImagesEnabled: false,
  // If tweet images is enabled or when  you use the !live command, these hashtags will be added to the tweet that's posted
  tweetHashtags: '#Twitch #OpenAI #Dalle3',
  // When you use the !live command, BlunderBot will tweet that you're live with the hashtags above.
  // Even if true, you can use notwitter in your !live <message> to skip sending the live tweet.
  announceLive: false
};

export default userTwitterConfig;
