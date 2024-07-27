import { Injectable } from '@nestjs/common';

import { RedisService } from 'src/database/redis/redis.service';

@Injectable()
export class AuthCacheService {
  constructor(private readonly redisService: RedisService) {}

  public async saveAccessTokenToRedis(
    userId: number,
    accessToken: string,
  ): Promise<void> {
    const multi = this.redisService.multi();

    await this.redisService.sAdd(`user_token:${userId}`, accessToken, multi);
    await this.redisService.expire(`user_token:${userId}`, 86400, multi);

    await this.redisService.exec(multi);
  }

  public async removeAccessTokenFromRedis(
    userId: number,
    accessToken: string,
  ): Promise<void> {
    await this.redisService.sRem(`user_token:${userId}`, accessToken);
  }

  public async isAccessTokenExist(
    userId: number,
    accessToken: string,
  ): Promise<boolean> {
    const userAccessTokens = await this.redisService.sMembers(
      `user_token:${userId}`,
    );

    return userAccessTokens.some((token: string) => token === accessToken);
  }
}
