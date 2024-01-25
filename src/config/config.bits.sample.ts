/**
 * Not required
 *
 * If a user cheers more than this amount, BlunderBot will run the commands and alerts listed below
 * Note any kings/opps with "secret_" in front can only be changed to by the owner of the channel or
 * the bot, and they won't be listed in the kings/opps command as generally available.
 */
const userBitsConfig: UserBitsConfig = {
  matches: {
    24: {
      commands: [
        '!gif !s9 happy new years',
        '!twitchspeak HAPPY NEW YEAR!',
        '!king secret_celebrate'
      ],
      alert: './public/sounds/happy_new_year.m4a'
    },
    2024: {
      commands: [
        '!gif !s9 happy new years',
        '!twitchspeak HAPPY NEW YEAR!',
        '!king secret_celebrate'
      ],
      alert: './public/sounds/happy_new_year.m4a'
    },
    69: {
      commands: ['!gif giggity', '!king secret_69', '!opp secret_quagmire'],
      alert: './public/sounds/giggity.m4a'
    },
    314: {
      commands: ['!gif !s15 pi', '!king secret_pie', '!opp secret_pie'],
      alert: './public/sounds/pie.m4a'
    },
    420: {
      commands: [
        '!gif snoop dogg',
        '!king secret_smoking',
        '!opp secret_snoop'
      ],
      alert: './public/sounds/snoop.m4a'
    }
  },
  // If there are no matches, run this for cheers 100 or more
  '100orMore': {
    commands: ['!gif !s12 cheers'],
    alert: './public/sounds/tig-ol-bitties.m4a'
  },
  // If there are no matches, run this for cheers 99 or less
  '99orLess': {
    commands: ['!gif !s12 cheers', '!king random', '!opp random'],
    alert: './public/sounds/tig-ol-bitties-short.m4a'
  }
};

export default userBitsConfig;
