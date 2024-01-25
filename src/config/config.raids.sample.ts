/**
 * Not required
 */
const userRaidsConfig: UserRaidsConfig = {
  // For Sounds, Music, and Alerts
  // You can use the private/ or priv/ directory for sounds that you don't want to share with the world
  // These directories are .gitignored
  // BlunderBot makes an announcement when any raid is detected. Use {raider} to say the raider's name
  announcement:
    "Hey {raider} and raiders, it's me, BlunderBot! Thank you so much for the raid!",
  // Commands to run when certain users raid the channel
  matches: {
    imrosen: {
      commands: ['!gif !s19 ambulance', '!opp rosen'],
      alert: './public/sounds/snoop.m4a'
    },
    grandmistresseyrun: {
      commands: ['!gif !s19 ', '!opp eyrun']
    },
    art_vega1983: {
      commands: ['!gif !s19 party', '!opp artvega']
    },
    spencenzug: {
      commands: ['!gif !s19 party', '!opp spencer']
    },
    themothman_: {
      commands: ['!opp mothman', '!gif !s19 mothman']
    },
    thecheesemate: {
      commands: ['!opp cheesemate', '!gif !s19 cheese cheese cheese']
    },
    lucyplayschess: {
      commands: ['!gif !s19 lucy charlie brown', '!opp lucy']
    },
    buttery_flaky: {
      commands: ['!gif !s19 butter', '!opp buttery_flaky']
    },
    strobex_gaming: {
      commands: ['!gif !s19 evil mustache man', '!opp strobex_gaming']
    },
    northcarolinadan: {
      commands: ['!gif !s19 jayhawk', '!opp jayhawk']
    },
    beholdg4: {
      commands: ['!gif !s19 g letter', '!opp einstein']
    }
  },
  // The default commands to run when a raid is detected but it's not from one of the users listed above
  defaultCommands: ['!gif !s19 party', '!opp random'],
  // The sound to play when a raid is detected if there's no alert specified in the matches above
  alert: './public/sounds/snoop.m4a'
};

export default userRaidsConfig;
