import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

function showLeaderboard(ctx: Context, commandState: CommandState) {
  if (!Object.keys(commandState.trivia.leaderboard).length) {
    return;
  }
  const leaderboard = Object.keys(commandState.trivia.leaderboard)
    .map((key) => {
      return {
        name: key,
        score: commandState.trivia.leaderboard[key]
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((user) => `${user.name}: ${user.score}`)
    .join(', ');
  ctx.botSpeak(`Leaderboard: ${leaderboard}`);
}

function showQuestion(ctx: Context, commandState: CommandState) {
  ctx.botSpeak(
    `Round ${commandState.trivia.round + 1}: ${
      CONFIG.trivia[commandState.trivia.round].question
    }`
  );
}

function nextQuestion(ctx: Context, commandState: CommandState) {
  if (commandState.trivia.round !== -1 && !commandState.trivia.roundAnswered) {
    ctx.botSpeak(
      `Nobody answered correctly! The correct answer was "${
        CONFIG.trivia[commandState.trivia.round].answers[0]
      }"`
    );
  }
  commandState.trivia.incorrectUsers = [];
  commandState.trivia.round++;
  commandState.trivia.roundAnswered = false;
  if (commandState.trivia.round >= CONFIG.trivia.length) {
    ctx.botSpeak('Trivia has ended! Congrats to the leaders!');
    showLeaderboard(ctx, commandState);
    commandState.trivia.started = false;
  } else {
    showQuestion(ctx, commandState);
  }
}

const command: Command = {
  name: 'trivia',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { commandState }) => {
    const answer = ctx.body?.toLowerCase().trim();
    if (answer === 'start' && ctx.tags.owner) {
      commandState.trivia.started = true;
      commandState.trivia.round = -1;
      commandState.trivia.leaderboard = {};
      ctx.botSpeak('Trivia started!');
      nextQuestion(ctx, commandState);
      return true;
    }

    // Allow showing the leaderboard even if trivia has just ended. We'll keep the leaderboard up.
    if (answer === 'leaderboard') {
      showLeaderboard(ctx, commandState);
      return true;
    }

    if (!commandState.trivia.started) {
      ctx.botSpeak('Trivia has not started yet!');
      return false;
    }

    if (answer === 'next' && ctx.tags.owner) {
      nextQuestion(ctx, commandState);
      return true;
    }

    if (!answer) {
      ctx.botSpeak(
        'Use !trivia <answer> to answer the trivia question. Also !trivia round, !trivia leaderboard, !trivia question'
      );
      return false;
    }

    if (answer === 'round') {
      ctx.botSpeak(
        `It's currently Round ${commandState.trivia.round + 1}/${
          CONFIG.trivia.length
        }`
      );
      return true;
    }

    if (answer === 'question') {
      showQuestion(ctx, commandState);
      return true;
    }

    if (
      commandState.trivia.roundAnswered ||
      commandState.trivia.incorrectUsers.includes(ctx.tags['display-name'])
    ) {
      return true;
    }

    if (
      CONFIG.trivia[commandState.trivia.round].answers.includes(
        answer.toLowerCase()
      )
    ) {
      const points =
        (commandState.trivia.leaderboard[ctx.tags['display-name']] || 0) + 1;
      commandState.trivia.roundAnswered = true;
      ctx.botSpeak(
        `"${answer}" is correct! @${ctx.tags['display-name']} got it right! They now have ${points} point(s).`
      );
      commandState.trivia.leaderboard[ctx.tags['display-name']] = points;
    } else {
      commandState.trivia.incorrectUsers.push(ctx.tags['display-name']);
    }
    return true;
  }
};

export default command;
