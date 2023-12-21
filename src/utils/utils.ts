import { FunctionQueue } from './FunctionQueue';
import { CONFIG } from '../config/config.service';

const player = require('play-sound')();
const ffmpeg = require('fluent-ffmpeg');
const { execSync } = require('child_process');

export function removeSymbols(text: string): string {
  return text.replace(/[^a-z0-9]/gi, '');
}

export function sleep(ms): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getAudioDurationInSeconds(filePath): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, function (err, metadata) {
      if (err) {
        reject(err);
        return;
      }
      resolve(metadata.format.duration);
    });
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
    for (const command of CONFIG.sounds[muteOrUnmute].programs) {
      await execSync(command);
    }
  } catch (error) {
    console.log(`Error muting or unmuting desktop apps.`);
    console.log(error);
  }
}

const audioFileQueue = new FunctionQueue();
export async function playAudioFile(filePath) {
  await audioFileQueue.enqueue(async function () {
    try {
      await muteOrUnmuteDesktopApps(true);
      const duration = await getAudioDurationInSeconds(filePath);
      await player.play(filePath);
      await sleep(duration * 1000 + 300);
      await muteOrUnmuteDesktopApps(false);
    } catch (error) {
      console.log(`Error playing audio file.`);
      console.log(error);
    }
  });
}

export function isNHoursLater(hours: number, previousTimestamp): boolean {
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

export function timeSince(date) {
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

export function getRandomElement(arr) {
  if (arr.length === 0) {
    return;
  }

  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}
