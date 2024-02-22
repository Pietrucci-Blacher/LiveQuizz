import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsResponse,
  ConnectedSocket,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class QuizzGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log('client', client.id, 'connected');
  }

  handleDisconnect(client: Socket) {
    console.log('client', client.id, 'disconnected');
  }

  @SubscribeMessage('joinQuizz')
  joinQuizz(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
    console.log('client', client.id, 'payload', payload);
    client.join(payload.quizzId);
    this.server.to(payload.quizzId).emit('joinQuizz', 'test');
  }

  @SubscribeMessage('createQuizz')
  createQuizz(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): WsResponse<any> {
    console.log('client', client.id, 'payload', payload);
    return { event: 'createQuizz', data: 'test' };
  }
}
