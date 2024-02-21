import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigV2Service } from '../configV2/configV2.service';

@Injectable()
export class LichessService {
  private logger: Logger = new Logger(LichessService.name);

  constructor(
    @Inject(forwardRef(() => ConfigV2Service))
    private readonly configV2Service: ConfigV2Service
  ) {
    //
  }

  async isGoodUser(username: string): Promise<boolean> {
    const res = await this.apiCall(`https://lichess.org/api/user/${username}`);
    const json = await res.json();
    return !json.closed && !json.disabled && !json.tosViolation;
  }

  async getCurrentGame(
    user = this.configV2Service.get().lichess.user,
    opts: { gameId?: boolean } = {}
  ): Promise<any> {
    const url = `https://lichess.org/api/users/status?withGameIds=true&ids=${user}`;
    const res = await (await fetch(url)).json();
    if (!res || !res[0]) {
      return;
    }
    if (res[0].playingId) {
      if (opts.gameId) {
        return res[0].playingId;
      } else {
        return `https://lichess.org/${res[0].playingId}`;
      }
    }
  }

  async getGameOpening(gameId: string): Promise<string> {
    try {
      const url = `https://lichess.org/game/export/${gameId}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const json = await res.json();
      return json.opening.name;
    } catch (e) {
      this.logger.error(e);
      return;
    }
  }

  async apiCall(
    url: string,
    options: { method?: string; json?: boolean; body?: any } = {
      method: 'GET',
      json: true
    }
  ): Promise<any> {
    const token = this.configV2Service.get().lichess.oauthToken;

    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);

    if (options?.json === undefined || options.json) {
      headers.set('Content-Type', 'application/json');
    }

    const request: RequestInit = {
      headers,
      method: options?.method || 'GET'
    };

    if (options?.body) {
      request['body'] = JSON.stringify(options.body);
    }

    return await fetch(url, request);
  }
}
