import { Module } from '@nestjs/common';
import { QuizzGateway } from './quizz.gateway';
import { QuizzService } from './quizz.service';

@Module({
  providers: [QuizzGateway, QuizzService],
  exports: [QuizzService],
})
export class QuizzModule {}
