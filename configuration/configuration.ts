import { Configuration } from './configuration.types';

// eslint-disable-next-line complexity,max-lines-per-function
export default (): Configuration => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  clientPort: parseInt(process.env.CLIENT_PORT, 10) || 5000,
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'secret',
    accessTokenExpirationTime:
      parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME) || 28800,
  },
  postgres: {
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    username: process.env.POSTGRES_USER || 'admin',
    password: process.env.POSTGRES_PASSWORD || 'admin',
    databaseName: process.env.POSTGRES_DB || 'tracking-db',
    synchronize: process.env.POSTGRES_SYNCHRONIZE === 'true',
    logging: process.env.POSTGRES_LOGGING === 'true',
  },
  mongoURI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tracking-db',
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
});
