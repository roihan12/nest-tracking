import { PostgresConfiguration } from './../../../configuration/configuration.types';
import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostgresDbConnectionService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const {
      host,
      password,
      username,
      port,
      databaseName,
      logging,
      synchronize,
    }: PostgresConfiguration = this.configService.get('postgres');

    return {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database: databaseName,
      logging,
      synchronize,
      logger: 'file',
      entities: [`${process.cwd()}/dist/src/users/*.entity.js`],
    };
  }
}
