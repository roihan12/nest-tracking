import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { UserDecorator } from './users.decorator';
import { UserResponseDto } from './users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  public async profile(
    @UserDecorator('id') id: number,
  ): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }
}
