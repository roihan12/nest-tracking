import { Exclude, Expose } from 'class-transformer';

import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

@Exclude()
export class UserResponseDto {
  @Expose()
  userId: number;

  @Expose()
  email: string;

  @Expose()
  username: string;
  @Expose()
  createdAt: Date;
}

export class CreateUserDto {
  @IsEmail({})
  email: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @MinLength(4)
  @MaxLength(12)
  password: string;
}
