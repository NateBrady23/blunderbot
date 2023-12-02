import { Platform } from '../../enums';

let commandsToCycle = [];
let currentInterval = null;

const command: Command = {
  name: 'autochat',
  ownerOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    // Always clearing the interval so multiple "on"s don't stack and anything else shuts it off
    clearInterval(currentInterval);
    if (ctx.body === 'on') {
      currentInterval = setInterval(
        () => {
          if (!commandsToCycle.length) {
            commandsToCycle = [
              [
                '!youtube',
                '!alert Check out the socials with !youtube !discord !team'
              ],
              [
                '!blunder',
                '!alert !s10 You can change my king with the !king command like !king cry'
              ],
              [
                '!chat !t1.3 make up a chess quote with a fake grandmaster name. Respond in a format like this: "quote" - Grandmaster Fake Name',
                "!alert !s10 You can change my opponent's king with the !opp command like !opp harmon"
              ],
              [
                '!twitchspeak !opp random',
                '!alert BM Nate Brady streams almost every night at 6pm PT. Check out the full schedule in the !discord'
              ],
              [
                '!team',
                '!alert !s10 Join the team to play in the weekly BBB, simuls, and more! Link in chat!'
              ],
              [
                "!twitchspeak It's December but Santa isn't bringing subs. You gotta do that yourself! Subs get access to special subscriber-only commands like !gif, !vchat, !tts",
                '!alert !s10 Sundays and Tuesdays are viewer challenge days! Check out the schedule in the !discord. !challenge'
              ],
              [
                '!discord',
                '!alert !s10 The Weekly BlunderReport for the BBB is released in the Discord channel. Check out the link in chat!'
              ],
              ['!twitchspeak !opp random'],
              [
                '!chat !t1.3 make up a chess quote with a fake grandmaster name. Respond in a format like this: "quote" - Grandmaster Fake Name',
                '!alert !s10 Add your name to the board with the "Buy a Square" channel redemption!'
              ],
              ['!prime'],
              ['!twitchspeak !king random'],
              [
                '!merch',
                '!alert !s10 The Blunder Buddies merch store is open! Check out the link in chat!'
              ],
              ['!quote'],
              [
                '!bbb',
                '!alert !s10 The BBB is a weekly viewer arena where the winner gets the BBB title on the stream. Check out the links in chat to join!'
              ],
              [
                '!alert !s10 To get a link to my current game, use the !game command'
              ],
              [
                '!alert !s10 Use the !chat command to ask BlunderBot a question. Example: !chat how do I get better at chess?'
              ],
              ['!opp random', '!king random']
            ];
          }

          const commands = commandsToCycle.pop();
          commands.forEach((c: string) => {
            void services.twitchService.ownerRunCommand(c);
          });
        },
        60 * 1000 * 2.5
      );
    }
    return true;
  }
};

export default command;
