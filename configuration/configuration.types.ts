export type JWTConfiguration = {
  accessTokenSecret: string;
  accessTokenExpirationTime: number;
};

export type PostgresConfiguration = {
  host: string;
  port: number;
  username: string;
  password: string;
  databaseName: string;
  synchronize: boolean;
  logging: boolean;
};

export type RedisConfiguration = {
  host: string;
  port: number;
};

export type Configuration = {
  port: number;
  environment: string;
  clientPort: number;
  mongoURI: string;
  jwt: JWTConfiguration;
  postgres: PostgresConfiguration;
  redis: RedisConfiguration;
};
