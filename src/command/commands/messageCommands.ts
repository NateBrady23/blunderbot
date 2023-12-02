import { ENV } from '../../config/config.service';

const afm: MessageCommand = {
  hideFromList: true,
  message:
    'AFM is a viewer title. It stands for Arena FIDE Master and is only visible on my stream. You can get titled on my stream with channel rewards.'
};

const backseat: MessageCommand = {
  hideFromList: true,
  aliases: ['suggestion', 'suggestions'],
  message: `Please don't make move suggestions, especially during rated games. Happy to look at moves after games end, but not during.`
};

const beholdg4: MessageCommand = {
  hideFromList: true,
  aliases: ['behold'],
  message: `Check out @BeholdG4's new podcast at https://www.twitch.tv/thefloatingpodcast `
};

const blunderbot: MessageCommand = {
  hideFromList: true,
  message: "I'm not mad Strobex, I am just disappointed."
};

const blunderreport: MessageCommand = {
  hideFromList: true,
  message: `The Blunder Report comes out the day after the BBB on the Discord at ${ENV.DISCORD_INVITE_LINK}. It is a weekly report that measures the number of blunders made, strength of blunders and more!`
};

const bm: MessageCommand = {
  message:
    'BM is a title I made up for myself. BM stands for Blunder Master. A noble title exclusively awarded by this channel to individuals who consistently demonstrate the ability to achieve defeat from the jaws of victory.'
};

const chess: MessageCommand = {
  hideFromList: true,
  message: 'chess is hard...'
};

const discord: MessageCommand = {
  message: `Keep talking to me on the Discord at ${ENV.DISCORD_INVITE_LINK}`
};

const dm: MessageCommand = {
  hideFromList: true,
  message:
    'DM is a viewer title. It stands for Dairy Master and is only visible on my stream. You can get titled on my stream with channel rewards.'
};

const em: MessageCommand = {
  hideFromList: true,
  message:
    'EM is a viewer title. It stands for Epic Master and is only visible on my stream. You can get titled on my stream with channel rewards.'
};

const fauxtog: MessageCommand = {
  hideFromList: true,
  message: '༼つ ◕_◕ ༽つ NATEBRADY TAKE MY ENERGY ༼ つ ◕_◕ ༽つ'
};

const github: MessageCommand = {
  hideFromList: true,
  message:
    'BlunderBot is now open sourced at https://github.com/NateBrady23/blunderbot'
};

const insubordinate: MessageCommand = {
  hideFromList: true,
  message: 'AND CHURLISH!'
};

const lurk: MessageCommand = {
  aliases: ['lurking', 'lurker', 'lurks'],
  hideFromList: true,
  message: 'Thanks for lurking! I appreciate you.'
};

const merch: MessageCommand = {
  aliases: ['blundershop', 'shop', 'blunderstore', 'store'],
  hideFromList: true,
  message: 'The BlunderShop is now live! https://blundershop.com'
};

const onlychess: MessageCommand = {
  hideFromList: true,
  message:
    'Join my community, where virtual chess players can find each other at onlychessplayers.net . If that link fails to load, try this one instead: https://discord.gg/MfsRvaMeqU'
};

const onlyfans: MessageCommand = {
  hideFromList: true,
  message:
    "Taken down by admins, due to crashing site's servers from too much traffic....."
};

const prime: MessageCommand = {
  hideFromList: true,
  message:
    'If you have Amazon Prime, you can subscribe and support the channel for free!'
};

const resign: MessageCommand = {
  hideFromList: true,
  message: 'It is time to end this madness!'
};

const rip: MessageCommand = {
  hideFromList: true,
  message: 'Strobex has died. RIP Strobex.'
};

const rm: MessageCommand = {
  hideFromList: true,
  message:
    'RM is a viewer title. It was awarded during the Eric Rosen vs Nate Brady YouTube viewer release stream. !rosen too see the video.'
};

const rosen: MessageCommand = {
  aliases: ['eric', 'ericrosen', 'imrosen'],
  message: 'www.youtube.com/watch?v=tX8eW5JfZyE'
};

const streamlabs: MessageCommand = {
  hideFromList: true,
  message:
    "If you're thinking about signing up for StreamLabs, please use my affiliate link: https://streamlabs.com/refer/natebrady23-cc34-10?t=2"
};

const team: MessageCommand = {
  message: `Join Brady's Blunder Buddies at https://lichess.org/team/${ENV.LICHESS_TEAM_ID}`
};

const tess: MessageCommand = {
  hideFromList: true,
  message:
    "Tess is @MrSwiftTickle's sister. It's always nice to check in on our friends and their families."
};

const tiktok: MessageCommand = {
  hideFromList: true,
  aliases: ['tik', 'tok'],
  message: 'Check out the tiktoks at https://www.tiktok.com/@natebrady23'
};

const tip: MessageCommand = {
  hideFromList: true,
  message: 'Give me just the tip at https://streamlabs.com/natebrady23/tip'
};

const youtube: MessageCommand = {
  aliases: ['yt'],
  message: 'Check out the youtubes at https://youtube.com/@natebrady'
};

export default {
  afm,
  backseat,
  beholdg4,
  blunderbot,
  blunderreport,
  bm,
  em,
  chess,
  discord,
  dm,
  fauxtog,
  github,
  insubordinate,
  lurk,
  merch,
  onlychess,
  onlyfans,
  prime,
  resign,
  rip,
  rosen,
  rm,
  streamlabs,
  team,
  tess,
  tiktok,
  tip,
  youtube
};
