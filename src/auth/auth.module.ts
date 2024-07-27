import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { AuthCacheService } from './auth.cache.service';
import { TokenModule } from './token/token.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User]), TokenModule],
  providers: [AuthService, AuthCacheService],
  exports: [TokenModule, AuthCacheService],
  controllers: [AuthController],
})
export class AuthModule {}
