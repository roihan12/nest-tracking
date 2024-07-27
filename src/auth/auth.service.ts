import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from 'src/users/users.dto';
import { LoginDto } from './auth.dto';
import { TokenService } from './token/token.service';
import { AuthCacheService } from './auth.cache.service';
import { AuthUserResponseDto } from './auth.dto';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authCacheService: AuthCacheService,
    @InjectRepository(User)
    private readonly usersRepositoryService: Repository<User>,
  ) {}

  public async registration(dto: CreateUserDto): Promise<AuthUserResponseDto> {
    const user = await this.createUser(dto);

    const tokens = await this.tokenService.composeTokens(user.userId);

    await this.authCacheService.saveAccessTokenToRedis(
      user.userId,
      tokens.accessToken,
    );

    return plainToInstance(AuthUserResponseDto, {
      ...user,
      ...tokens,
    });
  }

  public async login(dto: LoginDto): Promise<AuthUserResponseDto> {
    const user = await this.usersRepositoryService.findOne({
      where: { email: dto.email },
    });

    if (!user || !bcrypt.compareSync(dto.password, user.password)) {
      throw new BadRequestException(
        'Invalid email or password. Please try again.',
      );
    }

    const tokens = await this.tokenService.composeTokens(user.userId);

    await this.authCacheService.saveAccessTokenToRedis(
      user.userId,
      tokens.accessToken,
    );

    return plainToInstance(AuthUserResponseDto, { ...user, ...tokens });
  }

  public async logout(userId: number, accessToken: string): Promise<void> {
    try {
      await this.authCacheService.removeAccessTokenFromRedis(
        userId,
        accessToken,
      );
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  private async createUser(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepositoryService.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = this.usersRepositoryService.create({
      ...dto,
      password: hashedPassword,
    });

    return this.usersRepositoryService.save(newUser);
  }
}
