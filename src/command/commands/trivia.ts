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

async function showQuestion(
  ctx: Context,
  commandState: CommandState,
  services: CommandServices
) {
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
  const timeLimit = CONFIG.get().trivia[commandState.trivia.round].timeLimit;
  if (timeLimit) {
    commandState.trivia.triviaTimeout = setTimeout(() => {
      ctx.botSpeak(`Time's up!`);
      endRound(ctx, commandState, services);
    }, timeLimit * 1000);
  }
}

function selectRoundWinner(
  ctx: Context,
  commandState: CommandState,
  services: CommandServices,
  answer: string,
  user: string
) {
  const seconds = (Date.now() - commandState.trivia.roundStartTime) / 1000;
  const roundPoints =
    CONFIG.get().trivia[commandState.trivia.round].points || 1;
  const points =
    (commandState.trivia.leaderboard[user.toLowerCase()] || 0) + roundPoints;
  commandState.trivia.roundAnswered = true;
  commandState.trivia.leaderboard[user.toLowerCase()] = points;
  if (
    !commandState.trivia.fastestAnswer ||
    seconds < commandState.trivia.fastestAnswer.seconds
  ) {
    commandState.trivia.fastestAnswer = {
      user,
      seconds
    };
  }
  // If it's not the first acceptable answer, put it in parens. For instance, if we accept
  // "franklin", but the first answer is "benjamin franklin", we'll put "franklin" in parens.
  let finalAnswer =
    (CONFIG.get().trivia[commandState.trivia.round].answers as string[])[0] ??
    CONFIG.get().trivia[commandState.trivia.round].answers;
  if (answer !== finalAnswer.toString()) {
    finalAnswer = `${answer} (${finalAnswer})`;
  }
  ctx.botSpeak(
    `"${finalAnswer}" is correct! @${user} got it right in ${seconds} seconds and earned ${roundPoints} points! They now have ${points} point(s).`
  );
  void services.twitchService.ownerRunCommand(
    `!alert {"${finalAnswer}"} is correct! {@${user}} got it right in {${seconds} seconds} and earned {${roundPoints} points}!`
  );
}

function endRound(
  ctx: Context,
  commandState: CommandState,
  services: CommandServices
) {
  commandState.trivia.roundEnded = true;

  if (commandState.trivia.triviaTimeout) {
    clearTimeout(commandState.trivia.triviaTimeout);
  }

  if (commandState.trivia.closestAnswer && !commandState.trivia.roundAnswered) {
    selectRoundWinner(
      ctx,
      commandState,
      services,
      commandState.trivia.closestAnswer.answer,
      commandState.trivia.closestAnswer.user
    );
  }

  if (commandState.trivia.round !== -1 && !commandState.trivia.roundAnswered) {
    ctx.botSpeak(
      `Nobody answered correctly! The correct answer was "${getCorrectAnswer(
        commandState.trivia.round
      )}"`
    );
  }
}

function getCorrectAnswer(round: number): number | string {
  if (Array.isArray(CONFIG.get().trivia[round].answers)) {
    return (CONFIG.get().trivia[round].answers as string[])[0];
  } else {
    return CONFIG.get().trivia[round].answers as number;
  }
}

function nextQuestion(
  ctx: Context,
  commandState: CommandState,
  services: CommandServices
) {
  if (!commandState.trivia.roundEnded) {
    endRound(ctx, commandState, services);
  }
  if (commandState.trivia.round >= CONFIG.get().trivia.length) {
    ctx.botSpeak('Trivia has ended! Congrats to the leaders!');
    showLeaderboard(ctx, commandState);
    commandState.trivia.started = false;
  } else {
    commandState.trivia.answeredUsers = [];
    commandState.trivia.round++;
    commandState.trivia.roundAnswered = false;
    commandState.trivia.roundEnded = false;
    commandState.trivia.closestAnswer = undefined;
    void showQuestion(ctx, commandState, services);
  }
}

const command: Command = {
  name: 'trivia',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { commandState, services }) => {
    const answer = ctx.body?.toLowerCase().trim();
    if (answer === 'start' && ctx.isOwner) {
      commandState.trivia.started = true;
      commandState.trivia.round = -1;
      commandState.trivia.leaderboard = {};
      ctx.botSpeak('Trivia started!');
      nextQuestion(ctx, commandState, services);
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

    if (answer === 'next' && ctx.isOwner) {
      nextQuestion(ctx, commandState, services);
      return true;
    }

    if (answer === 'end' && ctx.isOwner) {
      endRound(ctx, commandState, services);
      return true;
    }

    if (answer === 'add' && ctx.isOwner) {
      // !trivia add <name> <points>
      commandState.trivia.leaderboard[ctx.args[1].toLowerCase()] +=
        +ctx.args[2];
      return true;
    }

    if (answer === 'replace' && ctx.isOwner) {
      // !trivia replace <name> <points>
      commandState.trivia.leaderboard[ctx.args[1].toLowerCase()] = +ctx.args[2];
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
      void showQuestion(ctx, commandState, services);
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
      commandState.trivia.roundEnded ||
      commandState.trivia.roundAnswered ||
      commandState.trivia.answeredUsers.includes(ctx.displayName)
    ) {
      return true;
    }

    if (CONFIG.get().trivia[commandState.trivia.round].closestTo) {
      // Always track that the user has already answered.
      commandState.trivia.answeredUsers.push(ctx.displayName);
      try {
        const answerNum = +answer;
        const correctNum =
          +CONFIG.get().trivia[commandState.trivia.round].answers;
        const difference = Math.abs(answerNum - correctNum);
        if (isNaN(answerNum)) {
          return true;
        }
        if (difference === 0) {
          // Someone got it exactly right
          selectRoundWinner(
            ctx,
            commandState,
            services,
            answer,
            ctx.displayName
          );
          endRound(ctx, commandState, services);
        } else if (
          !commandState.trivia.closestAnswer ||
          difference < commandState.trivia.closestAnswer.difference
        ) {
          commandState.trivia.closestAnswer = {
            user: ctx.displayName,
            difference,
            answer
          };
        }
      } catch (e) {
        console.error(`Error during trivia with answer: ${answer}`);
        console.error(e);
      }
      return true;
    } else if (
      (
        CONFIG.get().trivia[commandState.trivia.round].answers as string[]
      ).includes(answer)
    ) {
      selectRoundWinner(ctx, commandState, services, answer, ctx.displayName);
    } else {
      commandState.trivia.answeredUsers.push(ctx.displayName);
    }
    return true;
  }
};

export default command;
