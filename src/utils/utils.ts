import { FunctionQueue } from './FunctionQueue';
import { CONFIG } from '../config/config.service';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

import playerImport = require('play-sound');
const player = playerImport({});

const ffmpeg = require('fluent-ffmpeg');

export function removeSymbols(text: string): string {
  return text.replace(/[^a-z0-9]/gi, '');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getAudioDurationInSeconds(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(
      filePath,
      function (
        err: any,
        metadata: { format: { duration: number | PromiseLike<number> } }
      ) {
        if (err) {
          reject(err);
          return;
        }
        resolve(metadata.format.duration);
      }
    );
  });
}

/**
 * Mutes or unmutes Firefox and Streamlabs OBS. I use one or both of these apps to play music
 * while streaming, and I want to mute them when I play a sound effect or BlunderBot talks.
 * @param mute
 */
export async function muteOrUnmuteDesktopApps(mute: boolean) {
  const muteOrUnmute = mute ? 'mute' : 'unmute';
  try {
    for (const command of CONFIG.get().sounds[muteOrUnmute].programs) {
      execSync(command);
    }
  } catch (error) {
    console.log(`Error muting or unmuting desktop apps.`);
    console.log(error);
  }
}

const audioFileQueue = new FunctionQueue();
export async function playAudioFile(filePath: string) {
  await audioFileQueue.enqueue(async function () {
    try {
      await muteOrUnmuteDesktopApps(true);
      const duration = await getAudioDurationInSeconds(filePath);
      player.play(filePath);
      await sleep(duration * 1000 + 300);
      await muteOrUnmuteDesktopApps(false);
      return true;
    } catch (error) {
      console.log(`Error playing audio file.`);
      console.log(error);
    }
  });
}

export function isNHoursLater(
  hours: number,
  previousTimestamp: number
): boolean {
  // Convert hours to milliseconds (hours * 60 * 60 * 1000)
  const hoursInMilliseconds = hours * 60 * 60 * 1000;
  const difference = Date.now() - previousTimestamp;

  // Return true if the difference is greater than or equal to hours in milliseconds
  return difference >= hoursInMilliseconds;
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getItemsBetweenDelimiters(
  str: string,
  delimiter: string
): string[] {
  const regex = new RegExp(`${delimiter}(.*?)${delimiter}`, 'g');
  const matches = [];
  let match;
  while ((match = regex.exec(str))) {
    matches.push(match[1]);
  }
  return matches;
}

export function timeSince(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ' years';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes';
  }
  return Math.floor(seconds) + ' seconds';
}

export function getRandomInt(): number {
  return Math.floor(Math.random() * 1000000);
}

export function getRandomIntBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getRandomElement<T>(arr: T[]) {
  if (!arr || arr.length === 0) {
    return;
  }

  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

// I'm so good at naming things
export function addStrToFileAfterStr(
  str: string,
  filePath: string,
  afterStr: string
) {
  try {
    const data = readFileSync(filePath, 'utf8');
    // Split the file content by lines
    const lines = data.split('\n');
    let found = false;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(afterStr)) {
        // Add the new text after this line
        lines.splice(i + 1, 0, str);
        found = true;
        break;
      }
    }

    if (!afterStr || !found) {
      lines.push(str);
    }

    // Join the lines back into a single string
    const updatedData = lines.join('\n');

    // Write the modified content back to the file
    writeFileSync(filePath, updatedData, 'utf8');
  } catch (e) {
    console.error(e);
  }
}
