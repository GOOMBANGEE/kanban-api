import { Injectable } from '@nestjs/common';
import { JwtUserInfo } from '../decorator/user.decorator';
import { Cache } from '@nestjs/cache-manager';

@Injectable()
export class CacheTokenUtil {
  constructor(private readonly cacheManager: Cache) {}

  async cacheToken(payload: JwtUserInfo, cacheKey: string) {
    const cache = await this.cacheManager.get(cacheKey);

    if (cache) {
      return cache;
    }

    // payload.exp => second
    const expiresIn = payload.exp * 1000;
    const now = Date.now(); // milliSecond
    const differenceInMilliseconds = expiresIn - now - 3000;
    const ttl = Math.max(differenceInMilliseconds, 1);

    await this.cacheManager.set(cacheKey, payload, ttl);

    return payload;
  }
}
