import { Message } from 'discord.js';
import { Platform } from '../../enums';

interface Violator {
  username: string;
  reason: 'TOS violation' | 'Account disabled' | 'Account closed';
}

interface LichessUser {
  username: string;
  disabled?: boolean;
  tosViolation?: boolean;
  closed?: boolean;
}

const command: Command = {
  name: 'violators',
  platforms: [Platform.Discord],
  run: async (ctx, { services }) => {
    const teamId = ctx.args[0] || services.configV2Service.get().lichess.teamId;

    const msgRef = <Message<true>>(
      await ctx.botSpeak(':hourglass: Checking for violators...')
    );

    fetch(`https://lichess.org/api/team/${teamId}/users?full=true`)
      .then((res) => res.text())
      .then((data) => {
        const violators: Violator[] = [];

        const members = data.split('\n').filter(Boolean);
        msgRef.edit(
          `:hourglass: Checking for violators... 0/(${members.length} members)`
        );
        let i = 0;
        members.forEach((member) => {
          i++;
          if (i % 10 === 0) {
            msgRef.edit(
              `:hourglass: Checking for violators... ${i}/${members.length}`
            );
          }
          const parsed = JSON.parse(member) as LichessUser;

          console.log(parsed);

          if (parsed.tosViolation) {
            violators.push({
              username: parsed.username,
              reason: 'TOS violation'
            });
          } else if (parsed.disabled) {
            violators.push({
              username: parsed.username,
              reason: 'Account disabled'
            });
          } else if (parsed.closed) {
            violators.push({
              username: parsed.username,
              reason: 'Account closed'
            });
          }
        });

        if (violators.length === 0) {
          msgRef.edit(':white_check_mark: No violators found!');
        } else {
          let str = `:rotating_light: Found ${violators.length}\n`;
          violators.forEach((violator) => {
            str += `<https://lichess.org/@/${violator.username}> (${violator.reason})\n`;
          });
          str += '---\n';
          str += `Kick here: <https://lichess.org/team/${teamId}/kick>`;
          msgRef.edit(str);
        }
      });
    return true;
  }
};

export default command;
