export interface JwtTokens {
  accessToken: string;
}

export enum JwtSignOptionEnum {
  AccessToken = 'AccessToken',
}

export interface PayloadTokenInterface {
  userId: number;
  iat: number;
  exp: number;
}
