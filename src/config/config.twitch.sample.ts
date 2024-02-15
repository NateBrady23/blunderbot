/**
 * REQUIRED!
 */

// The following was an application created in the BlunderBot23 twitch account to get API access
// Replace the client id with your own and then copy the access token from the return URL (even if it doesn't load properly) into the appropriate api*OauthToken
// https://id.twitch.tv/oauth2/authorize?client_id=6xn7b1yy6ckmtjrw80kqacr8o9ppjt&redirect_uri=http://localhost:3000&callback&response_type=token&scope=analytics:read:extensions+user:edit+user:read:email+clips:edit+bits:read+analytics:read:games+user:edit:broadcast+user:read:broadcast+chat:read+chat:edit+channel:moderate+channel:read:subscriptions+whispers:read+whispers:edit+moderation:read+channel:read:redemptions+channel:edit:commercial+channel:read:hype_train+channel:read:stream_key+channel:manage:extensions+channel:manage:broadcast+user:edit:follows+channel:manage:redemptions+channel:read:editors+channel:manage:videos+user:read:blocked_users+user:manage:blocked_users+user:read:subscriptions+user:read:follows+channel:manage:polls+channel:manage:predictions+channel:read:polls+channel:read:predictions+moderator:manage:automod+channel:manage:schedule+channel:read:goals+moderator:read:automod_settings+moderator:manage:automod_settings+moderator:manage:banned_users+moderator:read:blocked_terms+moderator:manage:blocked_terms+moderator:read:chat_settings+moderator:manage:chat_settings+channel:manage:raids+moderator:manage:announcements+moderator:manage:chat_messages+user:manage:chat_color+channel:manage:moderators+channel:read:vips+channel:manage:vips+user:manage:whispers+channel:read:charity+moderator:read:chatters+moderator:read:shield_mode+moderator:manage:shield_mode+moderator:read:shoutouts+moderator:manage:shoutouts+moderator:read:followers+channel:read:guest_star+channel:manage:guest_star+moderator:read:guest_star+moderator:manage:guest_star+user:write:chat+user:read:chat+channel:bot+user:bot&force_verify=true
const userTwitchConfig: UserTwitchConfig = {
  // A list of commands to run when a subscription is detected
  onSubscribe: ['!sound ./public/sounds/this-does-not-exist.mp3'],
  welcome: {
    enabled: true,
    message: 'Welcome in, {user}, Hope you stick around awhile.',
    ignoreUsers: ['PretzelRocks']
  },
  // Maximum message length for the bot to speak. If the message is longer than this, it will be rejected completely to
  // avoid spamming. 500 characters fills one twitch message.
  maxMessageLength: 1500,
  // Optional - Set this if you want to be able to use !queue open or !queue close to automatically open and close
  // a challenge reward queue. Related: Challenge me! custom reward example above. Unfortunately, the Twitch API
  // only allows you to edit a reward that was created by the same client ID. So you'll have to create the reward
  // using blunderbot and then set the id here. The easiest way to do that with blunderbot is to send a POST request
  // to the <blunderbot>/api/twitch/custom-reward endpoint with the reward title and cost in the body. You can then edit the
  // reward in the twitch dashboard to add a description and image.
  challengeRewardId: '220961fa-a9bf-4038-a40d-cb13c0ddc889',
  // You don't need to edit this unless you're doing local testing using the twitch cli
  // https://dev.twitch.tv/docs/cli/websocket-event-command/
  eventWebsocketUrl:
    'wss://eventsub.wss.twitch.tv/ws?keepalive_timeout_seconds=600',
  eventSubscriptionUrl: 'https://api.twitch.tv/helix/eventsub/subscriptions'
  // eventWebsocketUrl: 'ws://127.0.0.1:8080/ws?keepalive_timeout_seconds=600',
  // eventSubscriptionUrl: 'http://127.0.0.1:8080/eventsub/subscriptions'
};

export default userTwitchConfig;
