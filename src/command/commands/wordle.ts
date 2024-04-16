import { Platform } from '../../enums';
import { getRandomElement } from '../../utils/utils';

const url =
  'https://dagshub.com/arjvik/wordle-wordlist/raw/e8d07d33a59a6b05f3b08bd827385604f89d89a0/answerlist.txt';

let wordList: string[];

// We can leave state here, until it needs to be shared between commands
// If needed, we can move it to CommandState
let chosenWord: string;
let users: { [key: string]: number } = {};

const command: Command = {
  name: 'wordle',
  help: 'Guess a 5-letter word by typing !wordle <word>. You may only guess once every 60 seconds. Capital means correct space. Lowercase means wrong space. If the word is funky, and you guess frown: F---n.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    const guess = ctx.body?.toLowerCase().trim();

    if (guess === 'new' && ctx.isOwner) {
      if (chosenWord) {
        void ctx.botSpeak('A round of wordle has already been started.');
        return false;
      }

      if (!wordList) {
        try {
          const response = await fetch(url);
          const text = await response.text();
          wordList = text.split('\n').filter((word) => word.trim().length > 0);
        } catch (error) {
          console.error('Error fetching word list:', error);
          void ctx.botSpeak("I couldn't fetch the word list. Try again later.");
          return false;
        }
      }

      if (!chosenWord) {
        chosenWord = getRandomElement(wordList);
      }
      void ctx.botSpeak(
        `A round of wordle has started! The Word list has ${wordList.length} words. Choose wisely!`
      );
      return true;
    }

    if (!chosenWord) {
      void ctx.botSpeak('A round of wordle has not been started yet.');
      return false;
    }

    if (guess.length !== 5) {
      ctx.reply(ctx, 'Guess must be 5 letters long');
      return false;
    }

    if (!wordList.includes(guess)) {
      ctx.reply(ctx, 'That word is not in my word list. Try again.');
      return false;
    }

    // Make sure the user hasn't guessed in the last 60 seconds
    if (users[ctx.displayName]) {
      const lastGuess = users[ctx.displayName];
      const currentTime = Date.now();
      if (currentTime - lastGuess < 60000) {
        ctx.reply(ctx, 'You must wait 60 seconds between guesses.');
        return false;
      }
    }

    if (guess === chosenWord) {
      void ctx.botSpeak(
        `@${ctx.displayName} got it! The word was ${chosenWord.toUpperCase()}!`
      );
      void services.twitchService.ownerRunCommand(`!define ${chosenWord}`);
      chosenWord = undefined;
      users = {};
      return true;
    }

    let buildReply = '';
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === chosenWord[i]) {
        buildReply += guess[i].toUpperCase();
      } else if (chosenWord.includes(guess[i])) {
        buildReply += guess[i];
      } else {
        buildReply += '-';
      }
    }

    ctx.reply(ctx, buildReply);

    users[ctx.displayName] = Date.now();
    return true;
  }
};

export default command;
