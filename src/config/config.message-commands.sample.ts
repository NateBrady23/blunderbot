/**
 * Not required
 *
 * Message commands can either be simple messages or a list of owner run commands.
 * User {username} to insert the user's name that used the command. Commands list will only run on twitch.
 */
import { Platform } from '../enums';

const userMessageCommandsConfig: UserMessageCommandsConfig = {
  afm: {
    message:
      'AFM is a viewer title. It stands for Arena FIDE Master and is only visible on my stream. You can get titled on my stream with channel rewards.'
  },
  backseat: {
    aliases: ['suggestion', 'suggestions'],
    message:
      "Please don't make move suggestions, especially during rated games. Happy to look at moves after games end, but not during."
  },
  beholdg4: {
    aliases: ['behold'],
    message:
      "Check out @BeholdG4's new podcast at https://www.twitch.tv/thefloatingpodcast"
  },
  blunderbot: {
    message: "I'm not mad Strobex, I am just disappointed."
  },
  blunderreport: {
    message:
      'The Blunder Report comes out the day after the BBB on the Discord at https://discord.gg/MfsRvaMeqU. It is a weekly report that measures the number of blunders made, strength of blunders and more!'
  },
  bm: {
    message:
      'BM is a title I made up for myself. BM stands for Blunder Master. A noble title exclusively awarded by this channel to individuals who consistently demonstrate the ability to achieve defeat from the jaws of victory.'
  },
  chess: {
    message: 'chess is hard...'
  },
  clock: {
    commands: [
      "!tts {username} wants you to know that you're running low on the clock."
    ]
  },
  discord: {
    message:
      'Keep talking to me on the Discord at https://discord.gg/MfsRvaMeqU'
  },
  dm: {
    message:
      'DM is a viewer title. It stands for Dairy Master and is only visible on my stream. You can get titled on my stream with channel rewards.'
  },
  drunkyskunky: {
    message: 'he does it with horses'
  },
  em: {
    message:
      'EM is a viewer title. It stands for Epic Master and is only visible on my stream. You can get titled on my stream with channel rewards.'
  },
  eyrun: {
    message:
      "Our friend Eyrun is going through some shit (Fuck Cancer)! If you'd like to help her out, please visit: https://streamlabs.com/grandmistresseyrun/tip"
  },
  fauxtog: {
    message: '༼つ ◕_◕ ༽つ NATEBRADY TAKE MY ENERGY ༼ つ ◕_◕ ༽つ'
  },
  gallery: {
    message:
      'All of the !image results are in the discord in the #gallery channel. Check it out here: https://discord.gg/MfsRvaMeqU'
  },
  github: {
    message:
      'BlunderBot is now open sourced at https://github.com/NateBrady23/blunderbot'
  },
  insubordinate: {
    message: 'AND CHURLISH!'
  },
  lurk: {
    aliases: ['lurking', 'lurker', 'lurks'],
    message: 'Thanks for lurking! I appreciate you.'
  },
  merch: {
    aliases: ['blundershop', 'shop', 'blunderstore', 'store'],
    message: 'The BlunderShop is now live! https://blundershop.com'
  },
  onlychess: {
    message:
      'Join my community, where virtual chess players can find each other at onlychessplayers.net. If that link fails to load, try this one instead: https://discord.gg/MfsRvaMeqU'
  },
  onlyfans: {
    message:
      "Taken down by admins, due to crashing site's servers from too much traffic....."
  },
  party: {
    ownerOnly: true,
    message: "It's time to party",
    commands: ['!gif !s19 party', '!sound ./public/sounds/snoop.m4a']
  },
  prime: {
    message:
      'If you have Amazon Prime, you can subscribe and support the channel for free!'
  },
  resign: {
    commands: [
      "!tts {username} wants you to know that it's time to end this madness."
    ]
  },
  rip: {
    message: 'Strobex has died. RIP Strobex.'
  },
  rm: {
    message:
      'RM is a viewer title. It was awarded during the Eric Rosen vs Nate Brady YouTube viewer release stream. !rosen to see the video.'
  },
  rosen: {
    aliases: ['eric', 'ericrosen', 'imrosen'],
    message: 'www.youtube.com/watch?v=tX8eW5JfZyE'
  },
  streamlabs: {
    message:
      "If you're thinking about signing up for StreamLabs, please use my affiliate link: https://streamlabs.com/refer/natebrady23-cc34-10?t=2"
  },
  team: {
    message:
      "Join Brady's Blunder Buddies at https://lichess.org/team/bradys-blunder-buddies"
  },
  tess: {
    message:
      "Tess is @MrSwiftTickle's sister. It's always nice to check in on our friends and their families."
  },
  tiktok: {
    aliases: ['tik', 'tok'],
    message: 'Check out the tiktoks at https://www.tiktok.com/@natebrady23'
  },
  tip: {
    message: 'Give me just the tip at https://streamlabs.com/natebrady23/tip'
  },
  train: {
    platforms: [Platform.Twitch],
    commands: [
      '!gif !s29 Sunglasses Racing GIF By Burger Records',
      '!king secret_train',
      '!sound ./public/sounds/train.m4a'
    ]
  },
  trophy: {
    commands: [
      '!king secret_trophy',
      "!tts {username} wants you to know that you've got yourself another Rosen trophy."
    ]
  },
  twitter: {
    message:
      'See images from the stream and get live announcements on twitter at https://twitter.com/natebrady23'
  },
  youtube: {
    aliases: ['yt'],
    message: 'Check out the youtubes at https://youtube.com/@natebrady'
  }
};

export default userMessageCommandsConfig;
