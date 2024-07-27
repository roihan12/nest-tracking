import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TokenResponseDto {
  @Expose()
  accessToken: string;
}
