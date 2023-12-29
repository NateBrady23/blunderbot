import { config } from 'dotenv';
import { readdirSync, readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { getRandomElement } from '../utils/utils';

config();

const kings: string[] = [];
const crowns: string[] = [];
const oppKings: string[] = [];
const themeConfig = {};
const soundboard: string[] = [];

[
  ['./public/images/kings', kings],
  ['./public/images/crowns', crowns],
  ['./public/images/opponents', oppKings],
  ['./public/sounds/soundboard', soundboard]
].forEach((publicFiles: [string, string[]]) => {
  readdirSync(publicFiles[0]).forEach((file) => {
    const fileName = file.split('.')[0];
    publicFiles[1].push(fileName);
  });
});

readdirSync('./public/images/themes').forEach((theme) => {
  themeConfig[theme] = {};

  readdirSync(`./public/images/themes/${theme}`).forEach((dir) => {
    if (dir === 'board.png') {
      themeConfig[theme].boardExists = true;
    } else {
      themeConfig[theme][dir] = {};
      readdirSync(`./public/images/themes/${theme}/${dir}`).forEach((file) => {
        const fileName = file.split('.')[0];
        themeConfig[theme][dir][fileName] = true;
      });
    }
  });
});

let CONFIG: Partial<YAMLConfig> = {};

try {
  const fileContents = readFileSync('./config.yml', 'utf8');
  CONFIG = yaml.load(fileContents);
} catch (e) {
  console.error('Error loading config.yml');
  console.error(e);
}

class ConfigService {
  constructor() {}

  public getRandomRapidApiKey() {
    return getRandomElement(CONFIG.rapidApi.keys);
  }

  public getThemeConfig() {
    return themeConfig;
  }

  public getKings() {
    return kings;
  }

  public getOppKings() {
    return oppKings;
  }

  public getCrowns() {
    return crowns;
  }

  public getSoundboard() {
    return soundboard;
  }
}

const configService = new ConfigService();

export { configService, CONFIG };
