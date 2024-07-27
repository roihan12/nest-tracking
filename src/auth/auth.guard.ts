import {
  CanActivate,
  ExecutionContext,
  Global,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthCacheService } from './auth.cache.service';
import { TokenService } from './token/token.service';
import { Repository } from 'typeorm';
import { User } from 'src/users/users.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Global()
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private authCacheService: AuthCacheService,
    @InjectRepository(User)
    private readonly usersRepositoryService: Repository<User>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    if (!authHeader) throw new UnauthorizedException();

    const accessToken = authHeader.split(' ')[1];
    console.log(accessToken);
    try {
      const { userId } = await this.tokenService.verifyToken(accessToken);

      const findTokenInRedis = await this.authCacheService.isAccessTokenExist(
        userId,
        accessToken,
      );

      if (!findTokenInRedis) {
        throw new UnauthorizedException();
      }

      request.user = await this.usersRepositoryService.findOne({
        where: { userId: userId },
      });
      request.user.accessToken = accessToken;

      return true;
    } catch (error) {
      await this.removeAccessTokenFromRedis(accessToken);

      throw new UnauthorizedException();
    }
  }

  private async removeAccessTokenFromRedis(accessToken: string): Promise<void> {
    const tokenPayload = this.tokenService.decodeToken(accessToken);

    await this.authCacheService.removeAccessTokenFromRedis(
      tokenPayload.userId,
      accessToken,
    );
  }
}
