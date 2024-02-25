import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Room } from './interfaces/rooms.interface';

@Injectable()
export class RoomsService {
  private rooms: Map<string, Room> = new Map();

  createRoom(quizId: string): string {
    const roomId = this.generateUniqueId();
    const newRoom: Room = {
      id: roomId,
      quizId,
      participants: new Set(),
      quizState: 'waiting',
    };
    this.rooms.set(roomId, newRoom);
    return roomId;
  }

  private generateUniqueId(): string {
    return `room_${Math.random().toString(36).substring(2, 15)}`;
  }
}

@WebSocketGateway({ namespace: '/rooms' })
export class RoomsGateway {
  constructor(private roomsService: RoomsService) {}

  @WebSocketServer() server: Server;

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
