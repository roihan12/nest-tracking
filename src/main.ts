import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocketIOAdapter } from './socket.io.adapter';

async function bootstrap() {
  const logger = new Logger('Main (main.ts)');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const clientPort = parseInt(configService.get('clientPort'));
  const port = parseInt(configService.get('port'));

  app.enableCors({
    origin: [
      `http://localhost:${clientPort}`,
      new RegExp(`/^http:\/\/192\.168\.1\.([1-9][1-9]\d):${clientPort}$/`),
    ],
  });
  const createValidationPipe = (): ValidationPipe => {
    return new ValidationPipe({
      transform: true,
      whitelist: true,
    });
  };
  app.useWebSocketAdapter(new SocketIOAdapter(app, configService));
  app.useGlobalPipes(createValidationPipe());
  await app.listen(port);

  logger.log(`Server running on port ${port}`);
}
bootstrap();
