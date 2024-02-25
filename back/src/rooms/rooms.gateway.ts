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
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';

@WebSocketGateway({ namespace: '/rooms' })
export class RoomsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private roomsService: RoomsService) {}

  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log('client', client.id, 'connected');
  }

  handleDisconnect(client: Socket) {
    console.log('client', client.id, 'disconnected');
    // this.roomsService.removeUserFromAllQuizz(client.id);
  }

  afterInit(server: Server) {
    // this.roomsService.setServer(server);
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @MessageBody() data: { quizId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    const roomId = this.roomsService.createRoom(data.quizId);
    client.join(roomId);
    return { event: 'roomCreated', data: { roomId } };
  }

  @SubscribeMessage('startQuiz')
  handleStartQuiz(@MessageBody() data: { roomId: string }) {
    this.server.to(data.roomId).emit('quizStarted');
  }
}
