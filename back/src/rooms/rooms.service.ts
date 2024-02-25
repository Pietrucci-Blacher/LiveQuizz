import { Injectable } from '@nestjs/common';
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
