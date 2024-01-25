/**
 * Not required
 */
const userTriviaConfig: UserTriviaConfig = [
  // A list of question/answers for the !trivia command.
  // Make sure all answers are in lowercase as they are matched to lowercased answers.
  // A user gets it correct if they match any of the answers.
  // Don't use keywords: "start", "question", "next", "round", "leaderboard" as answers.
  {
    question:
      "If BM Nate Brady is playing white, you'll almost always see a pawn on this square in the opening.",
    answers: ['c4'],
    points: 12
  },
  {
    question:
      'How does the horsey move? No, just kidding. How many knights can you fit on a chessboard without them attacking each other?',
    answers: ['32'],
    points: 10
  },
  {
    question:
      "I'm BlunderBot. I could beat anyone at chess. This was the last year a top player beat a top computer under tournament conditions.",
    answers: ['2005'],
    points: 10
  },
  {
    question:
      'Unable to give his acceptance speech because he died more than 200 years prior, this first postmaster general was inducted into the US Chess Hall of Fame in 1999.',
    answers: ['benjamin franklin', 'ben franklin', 'franklin'],
    points: 10
  },
  {
    question: 'Who was the last American to win Tata Steel?',
    answers: ['fabiano caruana', 'caruana'],
    points: 10
  },
  {
    question:
      "BM Nate Brady plays this variation in the Italian Game / Knight's attack as black. 5. ... Nd4!? Named after a chess computron.",
    answers: ['fritz variation', 'fritz', 'the fritz', 'the fritz variation'],
    points: 12
  },
  {
    question:
      "After switching over to the new weekly format where the winner keeps the BBB title, the winner of Week #1 of the Brady's Blunder Buddies was this lichess username.",
    answers: ['hendrixmaine'],
    points: 12
  },
  {
    question: "The weakest Polgar sister. (she's still stronger than you!)",
    answers: ['sofia', 'zsofia', 'zsofia polgar', 'sofia polgar'],
    points: 10
  },
  {
    question:
      "If you're on the team (https://lichess.org/team/bradys-blunder-buddies), do you know tonight's secret word?",
    answers: ['resign'],
    points: 12
  },
  {
    question:
      'Hikaru Nakamura appeared in one episode of this Showtime series about a hedge fund manager. Magnus rejected their offer.',
    answers: ['billions'],
    points: 10
  },
  {
    question: 'Chess streamer lularobs just earned this chess title today.',
    answers: ['wcm', "women's candidate master", 'women candidate master'],
    points: 10
  },
  {
    question:
      'Back to that Tata Steel tournament... What country is that in anyway?',
    answers: ['the netherlands', 'netherlands', 'holland'],
    points: 10
  }
];

export default userTriviaConfig;
