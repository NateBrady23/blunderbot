import { Platform } from '../../enums';

interface WordDefinition {
  word: string;
  phonetic: string;
  phonetics: Array<{
    text: string;
    audio: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      synonyms: string[];
      antonyms: string[];
    }>;
    synonyms: string[];
    antonyms: string[];
  }>;
  license: {
    name: string;
    url: string;
  };
  sourceUrls: string[];
}

const command: Command = {
  name: 'define',
  help: `Get the definition of a word. Usage: !define <word>`,
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    const word = ctx.args[0]?.trim();
    if (!word) {
      ctx.botSpeak(command.help);
      return false;
    }
    try {
      const res = await services.lichessService.apiCall(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      const json: WordDefinition = (await res.json())[0];
      if (!json?.word) {
        ctx.botSpeak(`I couldn't find a definition for ${word}.`);
        return false;
      }
      let toSpeak = `${json.word} (${json.phonetic}): `;
      for (let i = 0; i < json.meanings.length && i < 2; i++) {
        const meaning = json.meanings[i];
        console.log(meaning);
        toSpeak += `${i + 1}. ${meaning.partOfSpeech}: ${meaning.definitions[0].definition} `;
      }
      ctx.botSpeak(toSpeak);
    } catch (e) {
      console.error(e);
    }
    return true;
  }
};

export default command;
