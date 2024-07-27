import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';

import { WsUnauthorizedException } from 'src/exceptions/ws.exceptions';
import { TokenService } from 'src/auth/token/token.service';
import { UsersService } from 'src/users/users.service';
import { SocketWithAuth } from 'src/auth/auth.dto';

@Injectable()
export class TrackingGatewayGuard implements CanActivate {
  private readonly logger = new Logger(TrackingGatewayGuard.name);

  constructor(
    private readonly jwtService: TokenService,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket: SocketWithAuth = context.switchToWs().getClient();

    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];

    if (!token) {
      this.logger.error('No authorization token provided');
      throw new WsUnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyToken(token);

      this.logger.debug(`Validating auth token before connection: ${payload}`);

      const { userId } = payload;

      const user = await this.userService.findById(userId);
      if (!user) {
        throw new WsUnauthorizedException('User not found');
      }

      return true;
    } catch (error) {
      this.logger.error('Invalid token', error);
      throw new WsUnauthorizedException('Invalid token');
    }
  }
}
