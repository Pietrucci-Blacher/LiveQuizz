import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QuizzService } from './quizz.service';
import { CreateQuizzDto } from './dto/create-quizz.dto';
import { FindQuizzDto } from './dto/find-quizz.dto';
import { AnswerQuestionQuizzDto } from './dto/answer-question-quizz.dto';
import { QuestionNoCorrect, Quizz } from './interfaces/quizz.interface';
import { UpdateQuizzDto } from './dto/update-quizz.dto';

@WebSocketGateway({
  cors: true,
})
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
    // this.quizzService.removeUserFromAllQuizz(client.id);
  }

  afterInit(server: Server) {
    this.quizzService.setServer(server);
  }

  @SubscribeMessage('createQuizz')
  createQuizz(
    @ConnectedSocket() client: Socket,
    @MessageBody() createQuizzDto: CreateQuizzDto,
  ) {
    try {
      this.quizzService.createQuizz(
        createQuizzDto.quizzId,
        client.id,
        createQuizzDto.questions,
      );
      client.emit('quizzCreated', {
        success: true,
        quizzId: createQuizzDto.quizzId,
      });
    } catch (error) {
      client.emit('quizzCreated', {
        success: false,
        message: 'Erreur lors de la création du quiz',
      });
    }
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

  @SubscribeMessage('getAllQuizz')
  getAllQuizz(@ConnectedSocket() client: Socket): WsResponse<Quizz[]> {
    const quizzList = this.quizzService.getAllQuizz();
    return { event: 'quizzList', data: quizzList };
  }

  @SubscribeMessage('updateQuizzQuestions')
  updateQuizzQuestions(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateQuizzDto: UpdateQuizzDto,
  ): void {
    try {
      this.quizzService.updateQuizzQuestions(
        updateQuizzDto.quizzId,
        updateQuizzDto.questions,
      );
      client.emit('quizzUpdated', { success: true });
    } catch (error) {
      client.emit('quizzUpdated', {
        success: false,
        message: 'Erreur lors de la mise à jour du quiz',
      });
    }
  }
}
