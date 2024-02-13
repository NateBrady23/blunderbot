import { Platform } from '../../enums';

const command: Command = {
  name: 'suggest',
  platforms: [Platform.Twitch],
  run: async (ctx, { commandState, services }) => {
    if (
      !services.configV2Service.get().openai?.enabled ||
      !services.configV2Service.get().openai?.chatModel
    ) {
      ctx.botSpeak('OpenAI is disabled in !suggest.');
      return false;
    }
    if (!commandState.wouldBeCommands[ctx.body]) {
      commandState.wouldBeCommands[ctx.body] =
        await services.openaiService.sendPrompt(
          `Tell the user that "${ctx.body}" isn't a command but tell them what it might be if it were`,
          {
            includeBlunderBotContext: true,
            platform: ctx.platform
          }
        );
    }
    ctx.botSpeak(' ' + commandState.wouldBeCommands[ctx.body]);
    return true;
  }
};

export default command;
