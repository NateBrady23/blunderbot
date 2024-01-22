import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';
import { sleep } from '../../utils/utils';

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

async function showQuestion(ctx: Context, commandState: CommandState) {
  ctx.botSpeak('Next question in 3...');
  await sleep(2000);
  ctx.botSpeak('2...');
  await sleep(2000);
  ctx.botSpeak('1...');
  await sleep(2000);
  commandState.trivia.roundStartTime = Date.now();
  ctx.botSpeak(
    `Round ${commandState.trivia.round + 1}: ${
      CONFIG.get().trivia[commandState.trivia.round].question
    }`
  );
}

function nextQuestion(ctx: Context, commandState: CommandState) {
  if (commandState.trivia.round !== -1 && !commandState.trivia.roundAnswered) {
    ctx.botSpeak(
      `Nobody answered correctly! The correct answer was "${
        CONFIG.get().trivia[commandState.trivia.round].answers[0]
      }"`
    );
  }
  commandState.trivia.incorrectUsers = [];
  commandState.trivia.round++;
  commandState.trivia.roundAnswered = false;
  if (commandState.trivia.round >= CONFIG.get().trivia.length) {
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
  run: async (ctx, { commandState, services }) => {
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
          CONFIG.get().trivia.length
        }`
      );
      return true;
    }

    if (answer === 'question') {
      showQuestion(ctx, commandState);
      return true;
    }

    if (answer === 'fastest') {
      if (!commandState.trivia.fastestAnswer) {
        ctx.botSpeak('No one has answered correctly yet!');
      } else {
        ctx.botSpeak(
          `@${commandState.trivia.fastestAnswer.user} answered correctly in ${commandState.trivia.fastestAnswer.seconds} seconds!`
        );
      }
      return true;
    }

    if (
      commandState.trivia.roundAnswered ||
      commandState.trivia.incorrectUsers.includes(ctx.tags['display-name'])
    ) {
      return true;
    }

    if (
      CONFIG.get().trivia[commandState.trivia.round].answers.includes(
        answer.toLowerCase()
      )
    ) {
      const seconds = (Date.now() - commandState.trivia.roundStartTime) / 1000;
      const roundPoints =
        CONFIG.get().trivia[commandState.trivia.round].points || 1;
      const points =
        (commandState.trivia.leaderboard[ctx.tags['display-name']] || 0) +
        roundPoints;
      commandState.trivia.roundAnswered = true;
      // If it's not the first acceptable answer, put it in parens. For instance, if we accept
      // "franklin", but the first answer is "benjamin franklin", we'll put "franklin" in parens.
      let finalAnswer =
        CONFIG.get().trivia[commandState.trivia.round].answers[0];
      if (answer !== finalAnswer) {
        finalAnswer = `${finalAnswer} (${answer})`;
      }
      ctx.botSpeak(
        `"${finalAnswer}" is correct! @${ctx.tags['display-name']} got it right in ${seconds} seconds and earned ${roundPoints} points! They now have ${points} point(s).`
      );
      void services.twitchService.ownerRunCommand(
        `!alert {"${finalAnswer}"} is correct! {@${ctx.tags['display-name']}} got it right in {${seconds} seconds} and earned {${roundPoints} points}!`
      );
      commandState.trivia.leaderboard[ctx.tags['display-name']] = points;

      if (
        !commandState.trivia.fastestAnswer ||
        seconds < commandState.trivia.fastestAnswer.seconds
      ) {
        commandState.trivia.fastestAnswer = {
          user: ctx.tags['display-name'],
          seconds
        };
      }
    } else {
      commandState.trivia.incorrectUsers.push(ctx.tags['display-name']);
    }
    return true;
  }
};

export default command;
