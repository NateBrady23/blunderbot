import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import * as querystring from 'querystring';
import { ConfigV2Service } from '../configV2/configV2.service';
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class SpotifyService {
  private readonly logger: Logger = new Logger(SpotifyService.name);

  private authCode = '';
  private refreshToken = '';
  private accessToken = '';
  private accessTokenExpires = 0;

  public constructor(
    @Inject(forwardRef(() => ConfigV2Service))
    private readonly configV2Service: WrapperType<ConfigV2Service>,
    @Inject(forwardRef(() => OpenaiService))
    private readonly openaiService: WrapperType<OpenaiService>
  ) {}

  public getAuthUrl(): string {
    return (
      'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: this.configV2Service.get().spotify?.clientId || '',
        scope:
          'user-read-playback-state user-modify-playback-state user-read-currently-playing app-remote-control streaming playlist-modify-public playlist-modify-private playlist-read-collaborative playlist-read-private user-library-modify user-library-read',
        redirect_uri: this.configV2Service.get().spotify?.redirectUri || '',
        state: '123456'
      })
    );
  }

  public setAuthCode(code: string): void {
    this.authCode = code;
  }

  public async getAccessToken(): Promise<string> {
    if (!this.accessToken || Date.now() > this.accessTokenExpires) {
      const url = 'https://accounts.spotify.com/api/token';
      const params = !this.accessToken
        ? new URLSearchParams({
            grant_type: 'authorization_code',
            redirect_uri: this.configV2Service.get().spotify?.redirectUri || '',
            code: this.authCode
          })
        : new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: this.refreshToken
          });

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(
              (this.configV2Service.get().spotify?.clientId || '') +
                ':' +
                (this.configV2Service.get().spotify?.clientSecret || '')
            ).toString('base64')
        },
        body: params,
        json: true
      };
      try {
        const res = await fetch(url, requestOptions);
        const data: {
          access_token: string;
          expires_in: number;
          refresh_token: string;
        } = await res.json();
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token || this.refreshToken;
        this.accessTokenExpires = Date.now() + data.expires_in * 1000;
      } catch (e) {
        this.logger.error(e);
        this.logger.error('Error getting Spotify access token');
        this.accessToken = '';
      }
    }
    return this.accessToken;
  }

  public async getTrackById(id: string): Promise<TrackItem | undefined> {
    const token = await this.getAccessToken();
    if (!token) {
      this.logger.error('No Spotify token available for track');
      return;
    }
    try {
      const res = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data: TrackItem = await res.json();
      return data;
    } catch (e) {
      this.logger.error(e);
      this.logger.error('Error getting Spotify track by id');
      return;
    }
  }

  public async getTrackFromSearch(
    query: string
  ): Promise<TrackItem | undefined> {
    const token = await this.getAccessToken();

    if (!token) {
      this.logger.error('No Spotify token available for search');
      return;
    }
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const data: SpotifySearchResponse = await res.json();

      let trackIndex = 0;

      // Improve search results with AI
      if (this.configV2Service.get().openai?.enabled) {
        try {
          const newItems = data.tracks.items.map((item) => {
            return {
              name: item.name,
              artists: item.artists.map((artist) => artist.name).join(', '),
              album: item.album.name,
              duration: item.duration_ms,
              isExplicit: item.explicit
            };
          });

          let prompt = `
        You are a helpful assistant that can help me find the best track from a search query.
        You have been given this query from a user: 
        <QUERY>
        ${query}
        </QUERY>
        You have been given these tracks: 
        <TRACKS>
        ${JSON.stringify(newItems)}
        </TRACKS>
        You need to return the index of the track that is the best match for the query. 
        `;
          if (!this.configV2Service.get().spotify?.allowExplicit) {
            prompt += `
          While searching for the best match, prefer tracks that are not explicit.
          `;
          }
          prompt += `
          Index starts at 0. Only return the index, no other text.
          `;

          const response = await this.openaiService.sendPrompt(prompt);
          trackIndex = parseInt(response);
        } catch (e) {
          this.logger.error(e);
          this.logger.error('Error improving search results with AI');
          trackIndex = 0;
        }
      }
      return data.tracks.items[trackIndex];
    } catch (e) {
      this.logger.error(e);
      this.logger.error('Error getting Spotify track from search');
      return;
    }
  }

  public async getCurrentTrack(): Promise<TrackItem | undefined> {
    const token = await this.getAccessToken();
    if (!token) {
      this.logger.error('No Spotify token available for current track');
      return;
    }
    try {
      const res = await fetch(
        'https://api.spotify.com/v1/me/player/currently-playing',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (res.status === 204) {
        this.logger.log('No track currently playing');
        return;
      }
      const data: { item: TrackItem } = await res.json();
      return data.item;
    } catch (e) {
      this.logger.error(e);
      this.logger.error('Error getting current Spotify track');
      return;
    }
  }

  public getTrackInfoFromTrack(track: TrackItem): string {
    let trackDetails = track.name;
    const artistNames = track.artists.map((artist) => artist.name).join(' ');
    if (artistNames) {
      trackDetails += ` by ${artistNames}`;
    }
    return trackDetails;
  }

  public async addTrackToQueue(uri: string): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) {
      this.logger.error('No Spotify token available for queue');
      return false;
    }
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/me/player/queue?uri=${uri}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (res.status === 200 || res.status === 204) {
        this.logger.log('Track added to Spotify queue');
        return true;
      } else {
        this.logger.error(res);
      }
    } catch (e) {
      this.logger.error(e);
      this.logger.error('Error adding Spotify track to queue');
    }
    return false;
  }

  public async skipTrack(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) {
      this.logger.error('No Spotify token available for skip');
      return false;
    }
    try {
      const res = await fetch(`https://api.spotify.com/v1/me/player/next`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.status === 204) {
        this.logger.log('Track skipped');
        return true;
      } else {
        this.logger.error(await res.json());
      }
    } catch (e) {
      this.logger.error(e);
      this.logger.error('Error skipping Spotify track');
    }
    return false;
  }
}
