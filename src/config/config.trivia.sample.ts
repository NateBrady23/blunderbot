/**
 * A list of question/answers for the !trivia command.
 * Make sure all answers are in lowercase as they are matched to lowercased answers.
 * A user gets it correct if they match any of the answers.
 * Don't use keywords: "start", "question", "end", "next", "round", "leaderboard" as answers.
 *
 * Optional properties for each question:
 * - timeLimit: number - The number of seconds before the round ends, even if there's no answer.
 * - closestTo: boolean - If true, the user who is closest to the correct answer wins.
 *
 * NOTE: if you use closestTo, use only 1 numerical answer, like - answers: 1000
 */

const userTriviaConfig: UserTriviaConfig = [
  {
    question:
      'One of the rarest titles on the Blunder Buddies stream is the M17 title. The day on which this title is awarded is named after this fifth-century patron saint.',
    answers: ['saint patrick', 'st patrick', 'st. patrick', 'patrick'],
    points: 10
  },
  {
    question:
      "Don't let these guys infiltrate the seventh rank! A pair of rooks that get there can have this nickname.",
    answers: [
      'pigs on the 7th',
      'blind pigs',
      'blind pig',
      'pigs on the seventh',
      'pigs'
    ],
    points: 10
  },
  {
    question:
      'In 2018, Magnus Carlsen defeated Fabiano Caruano to win the World Chess Championship. In that same year, who beat the Dodgers to become the World Series champions?',
    answers: ['boston red sox', 'red sox', 'the red sox', 'bosox', 'redsox'],
    points: 10
  },
  {
    question:
      'More informally known as the "Criss Cross Applesauce Checkmate", the checkmate named after this person involves 2 bishops.',
    answers: ['boden', 'sam boden', 'samuel boden'],
    points: 10
  },
  {
    question: "If you're on the team, you know tonight's secret word!",
    answers: ['desperado'],
    points: 10
  },
  {
    question:
      'These small, often spherical objects strung together in jewelry may allegedly also be useful in providing chess assistance.',
    answers: ['beads', 'bead'],
    points: 10
  },
  {
    question:
      'What is the total number of squares you can make on the board, counting all individual squares of all sizes? Closest wins the round!',
    answers: 204,
    closestTo: true,
    timeLimit: 60,
    points: 10
  },
  {
    question:
      'Chess popularity skyrocketed after Anya Taylor-Joy portrayed this chess prodigy in a Netflix miniseries.',
    answers: [
      "the queen's gambit",
      'the queens gambit',
      'queens gambit',
      "queen's gambit"
    ],
    points: 10
  },
  {
    question:
      "Don't order an Uber! This preferred method of transportation by friend of the stream Eric Rosen is often requested by him during his streams.",
    answers: ['ambulance', 'an ambulance', 'ambulances'],
    points: 10
  },
  {
    question:
      'No jerking around. In the weekly BBB tournament, the time control is 5+3. But the dedicated zerkers must play all their moves within this many seconds.',
    answers: ['150', 'one hundred fifty', 'one hundred and fifty'],
    points: 10
  },
  {
    question:
      "Should BM's be allowed into the US chess hall of fame? If BM Nate Brady drives from his garage studio to make his case about how many miles would he drive? Closest wins the round!",
    answers: 1750,
    closestTo: true,
    timeLimit: 60,
    points: 10
  },
  {
    question:
      'This same term can be used for someone you might see on a park bench in Washington Square Park and also something you might see on the magazine rack at your local bookstore.',
    answers: ['hustler'],
    points: 10
  },
  {
    question:
      'NateBrady23 has 210 subscribers on his YouTube channel. Which chess YouTube channel currently has 4.59 MILLION subscribers?',
    answers: ['gothamchess', 'gotham chess'],
    points: 10
  },
  {
    question:
      'Chess is played on an 8x8 board. This strategy game is played on a 9x9 board and is very popular in Japan.',
    answers: ['shogi'],
    points: 10
  },
  {
    question:
      "This International Master and prolific chess author was consulted for the chess scene in Harry Potter and the Sorcerer's Stone.",
    answers: ['jeremy silman', 'silman'],
    points: 10
  },
  {
    question:
      "Should BM's be allowed into the US chess hall of fame? If BM Nate Brady drives from his garage studio to make his case about how many miles would he drive? Closest wins the round!",
    answers: 1750,
    closestTo: true,
    timeLimit: 60,
    points: 10
  }
];

export default userTriviaConfig;
