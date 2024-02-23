import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  WsResponse,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { QuizzService } from './quizz.service';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { FindQuizzDto } from './dto/find-quizz.dto';
import { AnswerQuestionQuizzDto  } from './dto/answer-question-quizz.dto';
import { QuestionNoCorrect } from './interfaces/quizz.interface';

@WebSocketGateway()
export class QuizzGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server: Server;

  constructor(private readonly quizzService: QuizzService) {}

  handleConnection(client: Socket) {
    console.log('client', client.id, 'connected');
  }

  handleDisconnect(client: Socket) {
    console.log('client', client.id, 'disconnected');
    this.quizzService.removeUserFromAllQuizz(client.id);
  }

  afterInit(server: Server) {
    this.quizzService.setServer(server);
  }

  @SubscribeMessage('createQuizz')
  createQuizz(
    @ConnectedSocket() client: Socket,
    @MessageBody() { quizzId, questions }: CreateQuizzDto,
  ) {
    this.quizzService.createQuizz(quizzId, client.id, questions);
  }

  @SubscribeMessage('joinQuizz')
  joinQuizz(
    @ConnectedSocket() client: Socket,
    @MessageBody() { quizzId }: FindQuizzDto,
  ): WsResponse<QuestionNoCorrect[]> {
    this.quizzService.addUsersToQuizz(quizzId, client.id);
    const questions: QuestionNoCorrect[] =
      this.quizzService.getQestionByQuizzId(quizzId, client.id);

    return { event: 'quizzQuestions', data: questions };
  }

  @SubscribeMessage('leaveQuizz')
  leaveQuizz(
    @ConnectedSocket() client: Socket,
    @MessageBody() { quizzId }: FindQuizzDto,
  ) {
    this.quizzService.removeUserFromQuizz(quizzId, client.id);
  }

  @SubscribeMessage('answerQuestion')
  answerQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody() { quizzId, question, answer }: AnswerQuestionQuizzDto,
  ): WsResponse<boolean> {
    const response: boolean = this.quizzService.answerQuestion(
      quizzId,
      client.id,
      question,
      answer,
    );
    return { event: 'answerQuestionResponse', data: response };
  }

  @SubscribeMessage('getQuestions')
  getQuestions(
    @ConnectedSocket() client: Socket,
    @MessageBody() { quizzId }: FindQuizzDto,
  ): WsResponse<QuestionNoCorrect[]> {
    const questions: QuestionNoCorrect[] =
      this.quizzService.getQestionByQuizzId(quizzId, client.id);

    return { event: 'quizzQuestions', data: questions };
  }
}
