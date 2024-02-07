/**
 * REQUIRED!
 */

// The following was an application created in the BlunderBot23 twitch account to get API access
// Replace the client id with your own and then copy the access token from the return URL (even if it doesn't load properly) into the appropriate api*OauthToken
// https://id.twitch.tv/oauth2/authorize?client_id=6xn7b1yy6ckmtjrw80kqacr8o9ppjt&redirect_uri=http://localhost:3000&callback&response_type=token&scope=analytics:read:extensions+user:edit+user:read:email+clips:edit+bits:read+analytics:read:games+user:edit:broadcast+user:read:broadcast+chat:read+chat:edit+channel:moderate+channel:read:subscriptions+whispers:read+whispers:edit+moderation:read+channel:read:redemptions+channel:edit:commercial+channel:read:hype_train+channel:read:stream_key+channel:manage:extensions+channel:manage:broadcast+user:edit:follows+channel:manage:redemptions+channel:read:editors+channel:manage:videos+user:read:blocked_users+user:manage:blocked_users+user:read:subscriptions+user:read:follows+channel:manage:polls+channel:manage:predictions+channel:read:polls+channel:read:predictions+moderator:manage:automod+channel:manage:schedule+channel:read:goals+moderator:read:automod_settings+moderator:manage:automod_settings+moderator:manage:banned_users+moderator:read:blocked_terms+moderator:manage:blocked_terms+moderator:read:chat_settings+moderator:manage:chat_settings+channel:manage:raids+moderator:manage:announcements+moderator:manage:chat_messages+user:manage:chat_color+channel:manage:moderators+channel:read:vips+channel:manage:vips+user:manage:whispers+channel:read:charity+moderator:read:chatters+moderator:read:shield_mode+moderator:manage:shield_mode+moderator:read:shoutouts+moderator:manage:shoutouts+moderator:read:followers+channel:read:guest_star+channel:manage:guest_star+moderator:read:guest_star+moderator:manage:guest_star+user:write:chat+user:read:chat+channel:bot+user:bot&force_verify=true
const userTwitchConfig: UserTwitchConfig = {
  ownerUsername: 'NateBrady23',
  channel: 'NateBrady23',
  ownerId: '11111111',
  botId: '22222222',
  botUsername: 'BlunderBot23',
  botPassword: 'oauth:yours',
  apiBotOauthToken: 'yourbottoken',
  apiOwnerOauthToken: 'yourownertoken',
  apiClientId: 'yourapiclientid',
  apiClientSecret: 'yourapiclientsecret',
  // A list of commands to run when a subscription is detected
  onSubscribe: ['!sound ./public/sounds/this-does-not-exist.mp3'],
  // Custom reward titles. If the server sees a custom reward with one of these titles, it will run the commands (as owner).
  // Make sure the title is exactly the same as it is on Twitch. Use {username} to insert the user's name into the command.
  // Use {message} to insert the user's message into the command.
  customRewardCommands: {
    'Pop the Confetti': ['!confetti'],
    'Let it Snow': ['!confetti snow'],
    'Make it Rain': ['!confetti rain', '!gif thunder and lightning in the sky'],
    'Enter the Matrix': ['!confetti matrix', '!opp neo'],
    "Change my opponent's rating": ['!opp-rating {message}'],
    'Title me on LiChess': [
      '!tts Blunder Master, {username} would like to be titled on lichess. They chose: {message}'
    ],
    'My own !command': [
      '!tts {username} has redeemed their own command. They chose: {message}'
    ],
    'Make me VIP': ['!tts {username} has redeemed VIP status.'],
    'Announce my arrival': [
      '!vchat Announce the arrival of {username} to the stream in a fun way. Come up with something original.'
    ],
    'Request a Song': ['!sr {message}'],
    "Sound: I don't need a queen": ['!sound naka-i-dont-need-a-queen']
  },
  // I like to make commands for specific people, like trevlar_ is the only one
  // who can use the !trophy command. Note that the owner and bot can run all commands.
  userRestrictedCommands: {
    clock: ['mammali_77'],
    dadjoke: ['northcarolinadan'],
    resign: ['strobex_gaming'],
    skipsong: ['loldayzo'],
    trophy: ['trevlar_']
  },
  // These commands are limited to followers only (optional)
  followerCommands: [
    'queue',
    'king',
    'opp',
    'chat',
    'followage',
    'translate',
    'trivia'
  ],
  // These commands are limited to subscribers only (optional)
  subCommands: ['gif', 'image', 'vchat', 'tts'],
  // VIPs can run these commands (optional)
  vipCommands: ['command1'],
  // Hype train conductors can run these commands (optional)
  // Note: Even though the train command is in the message-commands config, you can still limit it here.
  hypeTrainConductorCommands: ['train'],
  // Founders can run these commands (optional)
  founderCommands: ['command3'],
  // These commands can only be run {n} times per user per stream
  limitedCommands: {
    highlight: 5,
    image: 6,
    tts: 5,
    vchat: 3,
    train: 1
  },
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
