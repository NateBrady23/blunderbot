import { Injectable, Logger } from '@nestjs/common';
import { ENV } from '../config/config.service';

@Injectable()
export class LichessService {
  private logger: Logger = new Logger(LichessService.name);

  constructor() {
    //
  }

  async isGoodUser(username: string): Promise<boolean> {
    const res = await this.apiCall(`https://lichess.org/api/user/${username}`);
    const json = await res.json();
    return !json.closed && !json.disabled && !json.tosViolation;
  }

  async getCurrentGame(user = ENV.LICHESS_USER, opts: any = {}): Promise<any> {
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

  async apiCall(
    url,
    options: { method?: string; json?: boolean; body?: any } = {
      method: 'GET',
      json: true
    }
  ): Promise<any> {
    const token = ENV.LICHESS_OAUTH_TOKEN;

    const request = {
      url,
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: options?.method || 'GET'
    };

    if (options?.json === undefined || options.json) {
      request['headers']['Content-type'] = 'application/json';
    }

    if (options?.body) {
      request['body'] = JSON.stringify(options.body);
    }

    return await fetch(url, request);
  }
}
