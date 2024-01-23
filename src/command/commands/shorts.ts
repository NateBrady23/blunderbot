import { isNHoursLater } from '../../utils/utils';
const { google } = require('googleapis');
import { CONFIG } from '../../config/config.service';
import { Platform } from '../../enums';

let cachedLatestShort;
const cachedLatestShortAt = Date.now();

async function getLastVideoByPlaylist(
  playlistId = CONFIG.get().youtube.shortsPlaylistId
) {
  const youtube = google.youtube({
    version: 'v3',
    auth: CONFIG.get().youtube.apiKey
  });

  try {
    // If the playlist has more than one page of videos, retrieve the last video from subsequent pages
    let lastVideo;
    let nextPageToken;
    let tried = false;
    while (!tried || nextPageToken) {
      tried = true;
      const nextPageResponse = await youtube.playlistItems.list({
        part: 'snippet',
        playlistId,
        maxResults: 50,
        pageToken: nextPageToken
      });
      lastVideo =
        nextPageResponse.data.items[nextPageResponse.data.items.length - 1];
      nextPageToken = nextPageResponse.data.nextPageToken;
    }

    return lastVideo;
  } catch (error) {
    console.error(`Error fetching videos for playlist "${playlistId}":`, error);
  }
}

const command: Command = {
  name: 'shorts',
  platforms: [Platform.Twitch, Platform.Discord],
  aliases: ['pants'],
  run: async (ctx) => {
    if (!CONFIG.get().youtube?.enabled) {
      console.log('YouTube is not enabled for !shorts command.');
      return false;
    }
    // Get a new video if we don't have one cached or if the cached one is more than 8 hours old
    if (
      !cachedLatestShort ||
      (cachedLatestShort && isNHoursLater(8, cachedLatestShortAt))
    ) {
      cachedLatestShort = await getLastVideoByPlaylist();
    }
    if (!cachedLatestShort) {
      ctx.botSpeak("I can't find this right now. Try again later.");
    } else {
      const title = cachedLatestShort.snippet.title.replace(
        /#[a-zA-Z]+( )?/gi,
        ''
      );
      ctx.botSpeak(
        `Check out my latest short: ${title} https://www.youtube.com/shorts/${cachedLatestShort.snippet.resourceId.videoId}`
      );
    }

    return true;
  }
};

export default command;
