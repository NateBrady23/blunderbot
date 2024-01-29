import { google, youtube_v3 } from 'googleapis';
import { CONFIG } from '../../config/config.service';
import { Platform } from '../../enums';
import { GaxiosResponse } from 'googleapis-common';

let cachedLatestShort: youtube_v3.Schema$PlaylistItem[] = [];

async function getLastVideosByPlaylist(
  playlistId = CONFIG.get().youtube.shortsPlaylistId
) {
  const youtube = google.youtube({
    version: 'v3',
    auth: CONFIG.get().youtube.apiKey
  });

  let itemsToReturn: youtube_v3.Schema$PlaylistItem[] = [];

  try {
    // If the playlist has more than one page of videos, retrieve the last video from subsequent pages
    let nextPageToken;
    let tried = false;
    while (!tried || nextPageToken) {
      tried = true;
      const nextPageResponse: GaxiosResponse<youtube_v3.Schema$PlaylistItemListResponse> =
        await youtube.playlistItems.list({
          part: ['snippet'],
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
  run: async (ctx) => {
    if (!CONFIG.get().youtube?.enabled) {
      console.log('YouTube not enabled in config for !shortslist command');
      return false;
    }
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
