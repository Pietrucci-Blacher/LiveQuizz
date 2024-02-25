import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuizzModule } from './quizz/quizz.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [QuizzModule, RoomsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
