import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import { plainToInstance } from 'class-transformer';

import { AuthCacheService } from '../auth.cache.service';

import { JwtSignOptionEnum, PayloadTokenInterface } from './token.interface';
import { TokenResponseDto } from './token.dto';

@Injectable()
export class TokenService {
  private [JwtSignOptionEnum.AccessToken]: JwtSignOptions;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authCacheService: AuthCacheService,
  ) {
    this.configureJwtSignOptions();
  }

  private configureJwtSignOptions = () => {
    const { accessTokenSecret, accessTokenExpirationTime } =
      this.configService.get('jwt');

    this[JwtSignOptionEnum.AccessToken] = {
      secret: accessTokenSecret,
      expiresIn: accessTokenExpirationTime,
    };
  };

  public composeAccessToken(userId: number): string {
    return this.composeToken(userId, JwtSignOptionEnum.AccessToken);
  }

  public composeToken(
    userId: number,
    jwtSignOptionsName: JwtSignOptionEnum,
  ): string {
    return this.jwtService.sign({ userId }, this[jwtSignOptionsName]);
  }

  public async composeTokens(userId: number): Promise<TokenResponseDto> {
    return plainToInstance(TokenResponseDto, {
      accessToken: this.composeAccessToken(userId),
    });
  }

  public async verifyToken(token: string): Promise<{ userId: number }> {
    return this.jwtService.verifyAsync(
      token,
      this[JwtSignOptionEnum.AccessToken],
    );
  }

  public async updateAccessToken(userId: number): Promise<{
    accessToken: string;
  }> {
    const accessToken = this.composeAccessToken(userId);

    await this.authCacheService.saveAccessTokenToRedis(userId, accessToken);

    return { accessToken: accessToken };
  }

  public decodeToken(token: string): PayloadTokenInterface {
    return this.jwtService.decode(token) as PayloadTokenInterface;
  }
}
