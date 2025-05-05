import { google, youtube_v3 } from 'googleapis';
import { Platform } from '../../enums';

let cachedLatestShort: youtube_v3.Schema$PlaylistItem[] = [];

async function getLastVideosByPlaylist(
  playlistId: string,
  apiKey: string
): Promise<youtube_v3.Schema$PlaylistItem[]> {
  const youtube = google.youtube({
    version: 'v3',
    auth: apiKey
  });

  let itemsToReturn: youtube_v3.Schema$PlaylistItem[] = [];

  try {
    // If the playlist has more than one page of videos, retrieve the last video from subsequent pages
    let nextPageToken: string | undefined = undefined;

    do {
      const response = (await youtube.playlistItems.list({
        part: ['snippet'],
        playlistId,
        maxResults: 50,
        pageToken: nextPageToken
      })) as {
        data: {
          items?: youtube_v3.Schema$PlaylistItem[];
          nextPageToken?: string;
        };
      };

      if (response.data.items) {
        itemsToReturn = itemsToReturn.concat(response.data.items);
      }

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    return itemsToReturn;
  } catch (error) {
    console.error(`Error fetching videos for playlist "${playlistId}":`, error);
    return [];
  }
}

const command: Command = {
  name: 'shortslist',
  ownerOnly: true,
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    const youtube = services.configV2Service.get().youtube;
    if (!youtube?.enabled) {
      console.log('YouTube not enabled in config for !shortslist command');
      return false;
    }

    if (!cachedLatestShort.length) {
      cachedLatestShort = await getLastVideosByPlaylist(
        youtube.shortsPlaylistId || '',
        youtube.apiKey || ''
      );
    }
    if (!cachedLatestShort.length) {
      void ctx.botSpeak("I can't find any shorts right now. Try again later.");
    } else {
      const last7 = cachedLatestShort.slice(0, 7);
      let toSay = '';
      last7.forEach((short) => {
        if (short.snippet?.title && short.snippet?.resourceId?.videoId) {
          const title = short.snippet.title.replace(/#[a-z]+( )?/gi, '');
          toSay += `${title} https://www.youtube.com/shorts/${short.snippet.resourceId.videoId}\n`;
        }
      });
      void ctx.botSpeak(toSay);
    }

    return true;
  }
};

export default command;
