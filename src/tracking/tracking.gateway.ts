import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Namespace } from 'socket.io';
import { SocketWithAuth } from 'src/auth/auth.dto';
import { WsCatchAllFilter } from 'src/exceptions/ws.catch.all.filter';
import { WsNotFoundException } from 'src/exceptions/ws.exceptions';
import { TrackingService } from './tracking.service';
import { TrackingGatewayGuard } from './tracking.gateway.guard';
import { TrackingDto } from './tracking.dto';

@UsePipes(new ValidationPipe())
@UseFilters(new WsCatchAllFilter())
@WebSocketGateway({
  namespace: 'trackings',
})
export class TrackingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(TrackingGateway.name);
  constructor(private readonly trackingService: TrackingService) {}

  @WebSocketServer() io: Namespace;

  //Gateway initialization
  afterInit(): void {
    this.logger.log('Gateway initialized');
  }

  @UseGuards(TrackingGatewayGuard)
  async handleConnection(@ConnectedSocket() client: SocketWithAuth) {
    const sockets = this.io.sockets;
    this.logger.debug(`Socket connected with userID: ${client.userId}`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);

    if (client.userId === undefined) {
      this.logger.debug(
        `Invalid userID: ${client.userId}, Connection terminated.`,
      );
      client.emit('exception', new WsNotFoundException('Invalid userID'));
      client.disconnect();
      return;
    }

    const roomName = String(client.userId);
    await client.join(roomName);

    const connectedClients = this.io.adapter.rooms?.get(roomName)?.size ?? 0;
    this.logger.debug(`userID: ${client.userId} joined room ${roomName}`);
    this.logger.debug(
      `Total clients connected to room: '${roomName}': ${connectedClients}`,
    );

    try {
      const location = await this.trackingService.getLocation(client.userId);
      this.io.to(roomName).emit('location_updated', location);
    } catch (error) {
      this.logger.error('Error getting or creating location:', error);
      client.emit(
        'exception',
        new WsNotFoundException('Error processing location'),
      );
      client.disconnect();
      return;
    }
  }

  async handleDisconnect(client: SocketWithAuth) {
    const sockets = this.io.sockets;
    const roomName = String(client.userId);
    const clientCount = this.io.adapter.rooms?.get(roomName)?.size ?? 0;

    this.logger.log(
      `Disconnecting socket: ${client.id} from room: ${roomName}`,
    );
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    this.logger.debug(
      `Total clients connected to room: '${roomName}': ${clientCount}`,
    );

    this.io.to(roomName).emit('location_updated');
  }

  @UseGuards(TrackingGatewayGuard)
  @SubscribeMessage('track_location')
  async updateLocation(
    @MessageBody() tracking: TrackingDto,
    @ConnectedSocket() client: SocketWithAuth,
  ): Promise<void> {
    this.logger.debug(
      `Attempting updated location for user ${client.userId} with ${tracking.latitude} and ${tracking.longitude}`,
    );

    const updatedLocation = await this.trackingService.updateLocation({
      userId: client.userId,
      latitude: tracking.latitude,
      longitude: tracking.longitude,
    });

    this.io.to(String(client.userId)).emit('location_updated', updatedLocation);
  }
}
