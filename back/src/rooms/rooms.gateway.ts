import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';

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
