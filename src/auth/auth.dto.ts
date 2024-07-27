import { Exclude, Expose } from 'class-transformer';
import { UserResponseDto } from 'src/users/users.dto';
import { IsEmail, MinLength } from 'class-validator';
import { Socket } from 'socket.io';

@Exclude()
export class AuthUserResponseDto extends UserResponseDto {
  @Expose()
  accessToken: string;
}

export type SocketWithAuth = Socket & AuthUserResponseDto;

export class LoginDto {
  @IsEmail({})
  email: string;
  @MinLength(4)
  password: string;
}
