import { CONFIG } from '../../config/config.service';
import { Platform } from '../../enums';

interface PollResponse {
  title: string;
  choices: { title: string }[];
}

const command: Command = {
  name: 'poll',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    if (!CONFIG.get().openai?.enabled) {
      console.log(`OpenAI is not enabled in !poll command.`);
      return false;
    }
    let question = ctx.body;
    if (!question) {
      return false;
    }

    let prompt = 'Create a poll around the topic of ' + question + '.';
    prompt +=
      ' Create three choices to choose from. Question is limited to 60 characters. Choices are limited to 25 characters each. Format your answer as a json string like {"title": "", choices: [{ "title": ""},{"title": "", {"title": ""]}. ';

    const poll = JSON.parse(
      (await services.openaiService.sendPrompt(question))
        .replace('```json', '')
        .replace('```', '')
        .trim()
    ) as PollResponse;
    // Twitch API has a limit of 60 characters for the question
    if (poll.title.length > 60) {
      poll.title = poll.title.substring(0, 58) + '..';
    }
    // Twitch API has a limit of 25 characters for each choice
    poll.choices.map((choice) => {
      if (choice.title.length > 25) {
        choice.title = choice.title.substring(0, 23) + '..';
      }
      return choice;
    });

    if (ctx.platform === Platform.Discord) {
      let reply = `If this were twitch, I would create this poll:\n`;
      reply += `Question: ${poll.title}\n`;
      reply += `Choices: \n${poll.choices
        .map((c, i) => i + '. ' + c.title)
        .join('\n')}`;
      ctx.botSpeak(reply);
      return true;
    }
    await services.twitchService.helixApiCall(
      'https://api.twitch.tv/helix/polls',
      'POST',
      {
        broadcaster_id: CONFIG.get().twitch.ownerId,
        title: poll.title,
        choices: poll.choices,
        duration: 180
      }
    );
    return true;
  }
};

export default command;
