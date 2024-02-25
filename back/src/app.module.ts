import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuizzModule } from './quizz/quizz.module';

@Module({
  imports: [QuizzModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
