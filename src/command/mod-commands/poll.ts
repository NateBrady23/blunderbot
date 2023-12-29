import { CONFIG } from '../../config/config.service';
import { Platform } from '../../enums';

const command: Command = {
  name: 'poll',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    let question: any = ctx.body;
    if (!question) {
      return;
    }
    question = 'Create a poll around the topic of ' + question + '.';
    question +=
      ' Create three choices to choose from. Question is limited to 60 characters. Choices are limited to 25 characters each. Format your answer as a json string like {"title": "", choices: [{ "title": ""},{"title": "", {"title": ""]}. ';

    try {
      question = JSON.parse(
        (await services.openaiService.sendPrompt(question))
          .replace('```json', '')
          .replace('```', '')
          .trim()
      );
      // Twitch API has a limit of 60 characters for the question
      if (question.title.length > 60) {
        question.title = question.title.substring(0, 58) + '..';
      }
      // Twitch API has a limit of 25 characters for each choice
      question.choices.map((choice) => {
        if (choice.title.length > 25) {
          choice.title = choice.title.substring(0, 23) + '..';
        }
        return choice;
      });
      question['broadcaster_id'] = CONFIG.twitch.ownerId;
      question['duration'] = 180;
    } catch (e) {
      console.log(e);
      return false;
    }

    if (ctx.platform === Platform.Discord) {
      let reply = `If this were twitch, I would create this poll:\n`;
      reply += `Question: ${question.title}\n`;
      reply += `Choices: \n${question.choices
        .map((c, i) => i + '. ' + c.title)
        .join('\n')}`;
      ctx.botSpeak(reply);
      return true;
    }
    await services.twitchService.helixOwnerApiCall(
      'https://api.twitch.tv/helix/polls',
      'POST',
      question
    );
    return true;
  }
};

export default command;
