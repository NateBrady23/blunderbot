/**
 * Not required
 *
 * When BlunderBot is marked as live, it will run each group of commands in order every 2.5 minutes.
 * Curly braces around alerts will use the accent color if you have the alerts overlay set up.
 */
const userAutoCommandsConfig: UserAutoCommandsConfig = [
  {
    commands: [
      '!youtube',
      '!alert Check out the socials with {!youtube} {!discord} {!twitter} {!team}'
    ]
  },
  {
    commands: [
      '!twitchspeak For a full list of commands, check out: https://github.com/NateBrady23/blunderbot/blob/main/COMMANDS.md',
      '!alert You can change my king with the {!king} command like {!king cry}'
    ]
  },
  {
    commands: [
      '!chat make up a chess quote with a fake grandmaster name. Respond in a format like this: "quote" - Grandmaster Fake Name',
      "!alert You can change my opponent's king with the {!opp} command like {!opp harmon}"
    ]
  },
  {
    commands: [
      '!twitchspeak !opp random',
      '!alert BM Nate Brady streams almost {every night} at 6pm PT. Check out the full schedule in the !discord'
    ]
  },
  {
    commands: [
      '!team',
      '!alert Join the team to play in the weekly {BBB}, simuls, and more! Link in chat!'
    ]
  },
  {
    commands: [
      '!twitchspeak Subscribers get access to special sub-only commands like !image, !gif, !vchat, !tts',
      '!alert Sundays and Tuesdays are viewer {challenge} days! Check out the schedule in the {!discord}. {!challenge}'
    ]
  },
  {
    commands: [
      '!discord',
      '!alert !s10 The Weekly {BlunderReport} for the {BBB} is released in the Discord channel. Check out the link in chat!'
    ]
  },
  {
    commands: [
      '!today',
      '!alert Subscribers get access to special sub-only commands like {!image}, {!gif}, {!vchat}, {!tts}'
    ]
  },
  {
    commands: [
      '!chat make up a chess quote with a fake grandmaster name. Respond in a format like this: "quote" - Grandmaster Fake Name',
      '!alert Add your name to the board with the "{Buy a Square}" channel redemption!'
    ]
  },
  {
    commands: [
      '!prime',
      '!alert If you have {Amazon Prime}, you can subscribe and support the channel for free!'
    ]
  },
  {
    commands: ['!twitchspeak !king random']
  },
  {
    commands: [
      '!merch',
      '!alert !s10 The Blunder Buddies merch store is open! Check out the link in chat!'
    ]
  },
  {
    commands: ['!quote']
  },
  {
    commands: [
      '!bbb',
      '!alert The {BBB} is a weekly viewer arena where the winner gets the {BBB} title on the stream. Check out the links in chat to join!'
    ]
  },
  {
    commands: [
      '!shorts',
      '!alert To get a link to my current game, use the {!game} command'
    ]
  },
  {
    commands: [
      '!alert Use the {!chat} command to ask BlunderBot a question. Example: !chat how do I get better at chess?'
    ]
  },
  {
    commands: [
      '!opp random',
      '!king random',
      '!alert There are lots of new channel redemptions, including sound alerts and full screen effects!'
    ]
  }
];

export default userAutoCommandsConfig;
