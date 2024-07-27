import { RedisService } from 'src/database/redis/redis.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    const userString = await this.redisService.get(username);

    if (!userString) {
      // If not in Redis, get data from PostgreSQL
      const user = await this.usersRepository.findOne({ where: { username } });

      if (user) {
        // Save user data in Redis with a 24-hour expiration (86400 seconds)
        await this.redisService.set(username, JSON.stringify(user), 86400);
      }
      return user;
    } else {
      // Parse JSON data retrieved from Redis
      return JSON.parse(userString) as User;
    }
  }

  async findById(userId: number): Promise<User | undefined> {
    const cacheKey = `user:${userId}`;
    const userString = await this.redisService.get(cacheKey);

    if (!userString) {
      // If not in Redis, get data from PostgreSQL
      const user = await this.usersRepository.findOne({ where: { userId } });

      if (user) {
        // Save user data in Redis with a 24-hour expiration (86400 seconds)
        await this.redisService.set(cacheKey, JSON.stringify(user), 86400);
      }
      return user;
    } else {
      // Parse JSON data retrieved from Redis
      return JSON.parse(userString) as User;
    }
  }
}
