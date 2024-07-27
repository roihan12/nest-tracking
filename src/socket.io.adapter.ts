import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { SocketWithAuth } from './auth/auth.dto';
import { TokenService } from './auth/token/token.service';

export class SocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIOAdapter.name);
  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const clientPort = parseInt(this.configService.get('clientPort'));

    const cors = {
      origin: [
        `http://localhost:${clientPort}`,
        new RegExp(`/^http:\/\/192\.168\.1\.([1-9][1-9]\d):${clientPort}$/`),
      ],
    };

    this.logger.log('Configuring socket.io server with custom CORS options', {
      cors,
    });
    const optionsWithCORS = {
      ...options,
      cors,
    };

    const jwtService = this.app.get(TokenService);
    const server: Server = super.createIOServer(port, optionsWithCORS);

    server.of('trackings').use(createTokenMiddleware(jwtService, this.logger));

    return server;
  }
}

const createTokenMiddleware = (jwtService: TokenService, logger: Logger) => {
  return (socket: SocketWithAuth, next: (err?: any) => void) => {
    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];

    logger.debug(`Validating auth token before connection: ${token}`);

    jwtService
      .verifyToken(token)
      .then(({ userId }) => {
        socket.userId = userId;
        next();
      })
      .catch(() => {
        next(new Error('FORBIDDEN ACCESS'));
      });
  };
};
