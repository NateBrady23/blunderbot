import { Platform } from '../../enums';
import { getRandomElement, sleep } from '../../utils/utils';

function showLeaderboard(ctx: Context, commandState: CommandState): string {
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
  return leaderboard;
}

async function recap(services: CommandServices, leaderboard: string) {
  const prompt = `Say thank you to all the players who played in trivia tonight. Write a summary of these players and their points in an exciting manner: ${leaderboard}`;
  await services.twitchService.ownerRunCommand(`!vchat ${prompt}`);
}

async function showQuestion(
  ctx: Context,
  commandState: CommandState,
  services: CommandServices
) {
  if (
    commandState.trivia.round >= services.configV2Service.get().trivia.length
  ) {
    void ctx.botSpeak('Trivia has ended! Congrats to the leaders!');
    const leaderboard = showLeaderboard(ctx, commandState);
    await recap(services, leaderboard);
    commandState.trivia.started = false;
    return;
  }

  const { timeLimit, question, closestTo } =
    services.configV2Service.get().trivia[commandState.trivia.round];

  await ctx.botSpeak('Next question in 3...');
  await sleep(2000);
  await ctx.botSpeak('2...');
  await sleep(2000);
  await ctx.botSpeak('1...');
  await sleep(2000);
  commandState.trivia.roundStartTime = Date.now();
  let speakQuestion = `Round ${commandState.trivia.round + 1}: ${question}`;
  if (closestTo) {
    speakQuestion += ` Closest wins!`;
  }
  if (timeLimit) {
    speakQuestion += ` ${timeLimit} seconds!`;
  }
  await ctx.botSpeak(speakQuestion);
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
  pointsModifier = 1
) {
  const seconds = (Date.now() - commandState.trivia.roundStartTime) / 1000;
  const roundPoints = Math.round(
    (services.configV2Service.get().trivia[commandState.trivia.round].points ||
      1) * pointsModifier
  );
  const users = commandState.trivia.roundWinners;
  for (const user of users) {
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
  }

  const finalAnswer =
    (
      services.configV2Service.get().trivia[commandState.trivia.round]
        .answers as string[]
    )[0] ??
    services.configV2Service.get().trivia[commandState.trivia.round].answers;

  let toSpeak = `"${finalAnswer}" is correct! Congrats to @${users[0]}`;
  if (users.length > 1) {
    for (let i = 1; i < users.length; i++) {
      toSpeak += ` and @${users[i]}`;
    }
  }
  toSpeak += `. They earned ${roundPoints} points for answering correctly.`;
  ctx.botSpeak(toSpeak);
  void services.twitchService.ownerRunCommand(`!alert ${toSpeak}`);
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
    commandState.trivia.roundWinners.push(
      commandState.trivia.closestAnswer.user
    );
    selectRoundWinner(
      ctx,
      commandState,
      services,
      commandState.trivia.closestAnswer.answer
    );
  }

  if (commandState.trivia.round !== -1 && !commandState.trivia.roundAnswered) {
    ctx.botSpeak(
      `Nobody answered correctly! The correct answer was "${getCorrectAnswer(
        commandState.trivia.round,
        services
      )}"`
    );
  }
}

function getCorrectAnswer(round: number, services: CommandServices): string {
  return services.configV2Service.get().trivia[round].answers[0];
}

function nextQuestion(
  ctx: Context,
  commandState: CommandState,
  services: CommandServices
) {
  if (!commandState.trivia.roundEnded) {
    endRound(ctx, commandState, services);
  }
  if (
    commandState.trivia.round >= services.configV2Service.get().trivia.length
  ) {
    ctx.botSpeak('Trivia has ended! Congrats to the leaders!');
    showLeaderboard(ctx, commandState);
    commandState.trivia.started = false;
  } else {
    commandState.trivia.answeredUsers = [];
    commandState.trivia.roundWinners = [];
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
      if (commandState.trivia.started) {
        void ctx.botSpeak(
          "Trivia has already started! I can't start it twice."
        );
        return false;
      }
      commandState.trivia.started = true;
      commandState.trivia.round = -1;
      commandState.trivia.leaderboard = {};
      await ctx.botSpeak('Trivia started!');
      nextQuestion(ctx, commandState, services);
      return true;
    }

    // Allow showing the leaderboard even if trivia has just ended. We'll keep the leaderboard up.
    if (answer === 'leaderboard') {
      showLeaderboard(ctx, commandState);
      return true;
    }

    if (!commandState.trivia.started) {
      void ctx.botSpeak('Trivia has not started yet!');
      return false;
    }

    if (answer === 'random' && ctx.isOwner) {
      void ctx.botSpeak(
        getRandomElement(Object.keys(commandState.trivia.leaderboard))
      );
      return true;
    }

    if (answer === 'next' && ctx.isOwner) {
      nextQuestion(ctx, commandState, services);
      return true;
    }

    if (answer === 'end' && ctx.isOwner) {
      endRound(ctx, commandState, services);
      return true;
    }

    if (answer.startsWith('add ') && ctx.isOwner) {
      // !trivia add <name> <points>
      let [user, points] = answer.split(' ').slice(1);
      // if points isn't a number, swap the values of user and points
      if (isNaN(+points)) {
        [user, points] = [points, user];
      }
      // if points still isn't a number, return false
      if (isNaN(+points)) {
        return false;
      }
      commandState.trivia.leaderboard[user] =
        (commandState.trivia.leaderboard[user] || 0) + +points;
      return true;
    }

    if (answer.startsWith('replace ') && ctx.isOwner) {
      // !trivia replace <name> <points>
      const [user, points] = answer.split(' ').slice(1);
      commandState.trivia.leaderboard[user] = +points;
      return true;
    }

    if (!answer) {
      void ctx.botSpeak(
        'Use !trivia <answer> to answer the trivia question. Also !trivia round, !trivia leaderboard, !trivia question'
      );
      return false;
    }

    if (answer === 'round') {
      void ctx.botSpeak(
        `It's currently Round ${commandState.trivia.round + 1}/${
          services.configV2Service.get().trivia.length
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
        void ctx.botSpeak('No one has answered correctly yet!');
      } else {
        void ctx.botSpeak(
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

    if (
      services.configV2Service.get().trivia[commandState.trivia.round].closestTo
    ) {
      // Always track that the user has already answered.
      commandState.trivia.answeredUsers.push(ctx.displayName);
      try {
        const answerNum = +answer;
        const correctNum =
          +services.configV2Service.get().trivia[commandState.trivia.round]
            .answers;
        const difference = Math.abs(answerNum - correctNum);
        if (isNaN(answerNum)) {
          return true;
        }
        if (difference === 0) {
          commandState.trivia.roundWinners.push(ctx.displayName);
          selectRoundWinner(
            ctx,
            commandState,
            services,
            answer,
            // Give double points for getting it exactly right
            1.5
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
    }

    if (
      (
        services.configV2Service.get().trivia[commandState.trivia.round]
          .answers as string[]
      ).includes(answer)
    ) {
      commandState.trivia.roundWinners.push(ctx.displayName);
      if (commandState.trivia.roundWinners.length === 1) {
        setTimeout(() => {
          selectRoundWinner(ctx, commandState, services, answer);
        }, 3000);
      }
    } else {
      commandState.trivia.answeredUsers.push(ctx.displayName);
    }
    return true;
  }
};

export default command;
