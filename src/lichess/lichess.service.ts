import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigV2Service } from '../configV2/configV2.service';

@Injectable()
export class LichessService {
  private readonly logger: Logger = new Logger(LichessService.name);

  public constructor(
    @Inject(forwardRef(() => ConfigV2Service))
    private readonly configV2Service: ConfigV2Service
  ) {
    //
  }

  public async isGoodUser(
    username: string
  ): Promise<{ isValid: boolean; reason?: string }> {
    const res = await this.apiCall(`https://lichess.org/api/user/${username}`);
    const json = await res.json();
    const maxGameRating = Math.max(
      json.perfs.bullet?.rating || 0,
      json.perfs.blitz?.rating || 0,
      json.perfs.rapid?.rating || 0,
      json.perfs.classical?.rating || 0
    );

    // If the user's puzzle rating is more than 1000 points higher than their highest game rating, something fishy is going on
    if (maxGameRating + 1000 < json.perfs.puzzle.rating) {
      return {
        isValid: false,
        reason: 'Puzzle rating is too high compared to game ratings.'
      };
    }

    // If json.createdAt (unix epoch) is less than 1 month ago, something fishy is going on
    if (json.createdAt > Date.now() - 2592000000) {
      return {
        isValid: false,
        reason: 'User account is less than 30 days old.'
      };
    }

    if (json.closed) {
      return { isValid: false, reason: 'User account is closed.' };
    }

    if (json.disabled) {
      return { isValid: false, reason: 'User account is disabled.' };
    }

    if (json.tosViolation) {
      return { isValid: false, reason: 'User has violated terms of service.' };
    }

    return { isValid: true };
  }

  public async getCurrentGame(
    user = this.configV2Service.get().lichess.user,
    opts: { gameId?: boolean } = {}
  ): Promise<string> {
    const url = `https://lichess.org/api/users/status?withGameIds=true&ids=${user}`;
    const res = await (await fetch(url)).json();
    if (!res?.[0]) {
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

  public async getGameOpening(gameId: string): Promise<string> {
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

  public async apiCall(
    url: string,
    options: { method?: string; json?: boolean; body?: unknown } = {
      method: 'GET',
      json: true
    }
  ): Promise<Response> {
    const token = this.configV2Service.get().lichess.oauthToken;

    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);

    if (options.json === undefined || options.json) {
      headers.set('Content-Type', 'application/json');
    }

    const request: RequestInit = {
      headers,
      method: options.method || 'GET'
    };

    if (options.body) {
      request['body'] = JSON.stringify(options.body);
    }

    return await fetch(url, request);
  }
}
