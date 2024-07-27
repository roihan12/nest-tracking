import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PostgresModule } from './postgres/postgres.module';

import configuration from '../../configuration/configuration';
import { RedisModule } from './redis/redis.module';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongoURI'),
      }),
      inject: [ConfigService],
    }),
    PostgresModule,
    RedisModule,
  ],
  exports: [RedisModule, PostgresModule],
})
export class DatabaseModule {}
