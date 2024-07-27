import { REDIS_CLIENT } from './redis.constanst';
import { Redis, ChainableCommander } from 'ioredis';

import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  public multi(): ChainableCommander {
    return this.redisClient.multi();
  }

  public async exec(multi: ChainableCommander): Promise<void> {
    const client = multi || this.redisClient;
    await client.exec();
  }

  public sAdd(
    hash: string,
    value: string,
    multi?: ChainableCommander,
  ): ChainableCommander | Promise<number> {
    const client = multi || this.redisClient;
    return client.sadd(hash, value);
  }

  public sRem(
    hash: string,
    setMember: string,
    multi?: ChainableCommander,
  ): ChainableCommander | Promise<number> {
    const client = multi || this.redisClient;
    return client.srem(hash, setMember);
  }

  public sMembers(hash: string): Promise<string[]> {
    return this.redisClient.smembers(hash);
  }

  public expire(
    key: string,
    time: number,
    multi?: ChainableCommander,
  ): ChainableCommander | Promise<number> {
    const client = multi || this.redisClient;
    return client.expire(key, time);
  }

  public async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  public async set(
    key: string,
    value: string,
    expire: number,
  ): Promise<string> {
    return this.redisClient.set(key, value, 'EX', expire);
  }
}
