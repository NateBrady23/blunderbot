import { Platform } from '../../enums';

const command: Command = {
  name: 'suggest',
  ownerOnly: true,
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState, services }) => {
    if (!commandState.wouldBeCommands[ctx.command]) {
      commandState.wouldBeCommands[ctx.command] =
        await services.openaiService.sendPrompt(
          `Tell the user that "${ctx.body}" isn't a command but tell them what it might be if it were`,
          {
            includeBlunderBotContext: true,
            platform: ctx.platform
          }
        );
    }
    ctx.botSpeak(' ' + commandState.wouldBeCommands[ctx.command]);
    return true;
  }
};

export default command;
