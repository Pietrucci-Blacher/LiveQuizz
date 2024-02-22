import { Module } from '@nestjs/common';
import { QuizzGateway } from './quizz.gateway';

@Module({
  providers: [QuizzGateway],
})
export class QuizzModule {}
