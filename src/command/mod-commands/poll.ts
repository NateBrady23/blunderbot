import { Platform } from '../../enums';

interface PollResponse {
  title: string;
  choices: { title: string }[];
}

const command: Command = {
  name: 'poll',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    if (ctx.isMod && ctx.args?.[0] === 'cancel') {
      console.log('in end poll');
      const currPoll = await services.twitchService.getPoll();
      await services.twitchService.endPoll(currPoll.id);
      return true;
    }

    if (!services.configV2Service.get().openai?.enabled) {
      console.log(`OpenAI is not enabled in !poll command.`);
      return false;
    }
    const question = ctx.body;
    if (!question) {
      return false;
    }

    const prompt =
      'Create a poll around the topic of ' +
      question +
      '.' +
      ' Create three choices to choose from. Question is limited to 60 characters. Choices are limited to 25 characters each. Format your answer as a json string like {"title": "", choices: [{ "title": ""},{"title": "", {"title": ""]}. ';

    const poll = JSON.parse(
      await services.openaiService.getChatCompletion(prompt, true)
    ) as PollResponse;
    // Twitch API has a limit of 60 characters for the question
    if (poll.title.length > 60) {
      poll.title = poll.title.substring(0, 58) + '..';
    }
    // Twitch API has a limit of 25 characters for each choice
    const choices = poll.choices.map((choice) => {
      if (choice.title.length > 25) {
        choice.title = choice.title.substring(0, 23) + '..';
      }
      return choice;
    });

    if (ctx.platform === Platform.Discord) {
      let reply = `If this were twitch, I would create this poll:\n`;
      reply += `Question: ${poll.title}\n`;
      reply += `Choices: \n${choices
        .map((c, i) => i + '. ' + c.title)
        .join('\n')}`;
      ctx.botSpeak(reply);
      return true;
    }
    await services.twitchService.createPoll({
      title: poll.title,
      choices: choices,
      duration: 180
    });
    return true;
  }
};

export default command;
