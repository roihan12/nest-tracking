import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostgresDbConnectionService } from './postgres.connection';
import { TransactionService } from './transaction';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: PostgresDbConnectionService,
    }),
  ],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class PostgresModule {}
