const { google } = require('googleapis');
import { ENV } from '../../config/config.service';
import { Platform } from '../../enums';

let cachedLatestShort = [];

async function getLastVideosByPlaylist(
  playlistId = ENV.YOUTUBE_SHORTS_PLAYLIST_ID
) {
  const youtube = google.youtube({
    version: 'v3',
    auth: ENV.YOUTUBE_API_KEY
  });

  let itemsToReturn = [];

  try {
    // If the playlist has more than one page of videos, retrieve the last video from subsequent pages
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
      itemsToReturn = itemsToReturn.concat(nextPageResponse.data.items);
      nextPageToken = nextPageResponse.data.nextPageToken;
    }

    return itemsToReturn;
  } catch (error) {
    console.error(`Error fetching videos for playlist "${playlistId}":`, error);
  }
}

const command: Command = {
  name: 'shortslist',
  platforms: [Platform.Twitch, Platform.Discord],
  ownerOnly: true,
  run: async (ctx) => {
    if (!cachedLatestShort.length) {
      cachedLatestShort = await getLastVideosByPlaylist();
    }
    if (!cachedLatestShort.length) {
      ctx.botSpeak("I can't find this right now. Try again later.");
    } else {
      const last7 = cachedLatestShort
        .slice(Math.max(cachedLatestShort.length - 7, 0))
        .reverse();
      let toSay = '';
      last7.forEach((short) => {
        const title = short.snippet.title.replace(/#[a-zA-Z]+( )?/gi, '');
        toSay += `${title} https://www.youtube.com/shorts/${short.snippet.resourceId.videoId}\n`;
      });
      ctx.botSpeak(toSay);
    }

    return true;
  }
};

export default command;
