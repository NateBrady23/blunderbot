import { Injectable, Logger } from '@nestjs/common';
import { CONFIG } from '../config/config.service';
import * as querystring from 'querystring';
// import * as querystring from 'querystring';

@Injectable()
export class SpotifyService {
  private logger: Logger = new Logger(SpotifyService.name);

  private authCode: string = '';
  private refreshToken: string = '';
  private accessToken: string = '';
  private accessTokenExpires: number;

  constructor() {}

  getAuthUrl(): string {
    return (
      'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: CONFIG.get().spotify.clientId,
        scope:
          'user-read-playback-state user-modify-playback-state user-read-currently-playing app-remote-control streaming playlist-modify-public playlist-modify-private playlist-read-collaborative playlist-read-private user-library-modify user-library-read',
        redirect_uri: CONFIG.get().spotify.redirectUri,
        state: '123456'
      })
    );
  }

  setAuthCode(code: string) {
    this.authCode = code;
  }

  async getAccessToken(): Promise<string> {
    if (!this.accessToken || Date.now() > this.accessTokenExpires) {
      const url = 'https://accounts.spotify.com/api/token';
      const params = !this.accessToken
        ? new URLSearchParams({
            grant_type: 'authorization_code',
            redirect_uri: CONFIG.get().spotify.redirectUri,
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
              CONFIG.get().spotify.clientId +
                ':' +
                CONFIG.get().spotify.clientSecret
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
        this.refreshToken = data.refresh_token;
        this.accessTokenExpires = Date.now() + data.expires_in * 1000;
      } catch (e) {
        this.logger.error(e);
        this.logger.error('Error getting Spotify access token');
        this.accessToken = '';
      }
    }
    return this.accessToken;
  }

  async getTrackById(id: string): Promise<TrackItem> {
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
      this.logger.error('Error getting Spotify track by id');
      return;
    }
  }
  async getTrackFromSearch(query: string): Promise<TrackItem> {
    const token = await this.getAccessToken();

    if (!token) {
      this.logger.error('No Spotify token available for search');
      return;
    }
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=track&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const data: SpotifySearchResponse = await res.json();
      for (const track of data.tracks.items) {
        if (
          query.includes('karaoke') ||
          !track.name.toLowerCase().includes('karaoke')
        ) {
          return track;
        }
      }
    } catch (e) {
      this.logger.error('Error getting Spotify track from search');
      return;
    }
  }

  async getCurrentTrack(): Promise<TrackItem> {
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
      this.logger.error('Error getting current Spotify track');
      return;
    }
  }

  getTrackInfoFromTrack(track: TrackItem): string {
    let trackDetails = track.name;
    const artistNames = track.artists.map((artist) => artist.name).join(' ');
    if (artistNames) {
      trackDetails += ` by ${artistNames}`;
    }
    return trackDetails;
  }

  async addTrackToQueue(uri: string): Promise<boolean> {
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
      if (res.status === 204) {
        this.logger.log('Track added to Spotify queue');
        return true;
      } else {
        this.logger.error(await res.json());
      }
    } catch (e) {
      this.logger.error(e);
      this.logger.error('Error adding Spotify track to queue');
    }
    return false;
  }

  async skipTrack(): Promise<boolean> {
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
