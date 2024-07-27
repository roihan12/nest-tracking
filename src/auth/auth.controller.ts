import { AuthService } from './auth.service';

import { UserDecorator } from 'src/users/users.decorator';

import { JwtAuthGuard } from './auth.guard';

import { AuthUserResponseDto } from './auth.dto';
import { CreateUserDto } from 'src/users/users.dto';
import { LoginDto } from './auth.dto';

import { Body, Controller, Post, UseGuards } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('registration')
  public async registration(
    @Body() dto: CreateUserDto,
  ): Promise<AuthUserResponseDto> {
    return this.authService.registration(dto);
  }

  @Post('login')
  public async login(@Body() dto: LoginDto): Promise<AuthUserResponseDto> {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  public async logout(
    @UserDecorator('id') id: number,
    @UserDecorator('accessToken') accessToken: string,
  ): Promise<void> {
    return this.authService.logout(id, accessToken);
  }
}
