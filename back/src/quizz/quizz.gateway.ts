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
  ): WsResponse<boolean> {
    const joined: boolean = this.quizzService.addUsersToQuizz(
      quizzId,
      client.id,
    );

    return { event: 'joinedQuizz', data: joined };
  }

  @SubscribeMessage('leaveQuizz')
  leaveQuizz(
    @ConnectedSocket() client: Socket,
    @MessageBody() { quizzId }: FindQuizzDto,
  ) {
    this.quizzService.removeUserFromQuizz(quizzId, client.id);
  }

  @SubscribeMessage('startQuizz')
  startQuizz(
    @ConnectedSocket() client: Socket,
    @MessageBody() { quizzId }: FindQuizzDto,
  ) {
    this.quizzService.startQuizz(quizzId, client.id);
  }

  @SubscribeMessage('stopQuizz')
  stopQuizz(
    @ConnectedSocket() client: Socket,
    @MessageBody() { quizzId }: FindQuizzDto,
  ) {
    this.quizzService.stopQuizz(quizzId, client.id);
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
    this.quizzService.sendNextQuestion(quizzId, question, client.id);

    return { event: 'answerQuestionResponse', data: response };
  }

  @SubscribeMessage('getQuestions')
  getQuestions(
    @ConnectedSocket() client: Socket,
    @MessageBody() { quizzId }: FindQuizzDto,
  ) {
    const quizz = this.quizzService.getQuizzById(quizzId);
    if (!quizz) {
      client.emit('error', 'Quiz not found');
      return;
    }

    let currentQuestionIndex = 0;
    const sendQuestion = () => {
      if (currentQuestionIndex < quizz.questions.length) {
        const questionNoCorrect = {
          question: quizz.questions[currentQuestionIndex].question,
          answers: quizz.questions[currentQuestionIndex].answers.map(
            (a) => a.answer,
          ),
        };

        client.emit('quizzQuestion', questionNoCorrect);
        startTimer(30, currentQuestionIndex);
        currentQuestionIndex++;
      } else {
        client.emit('quizzEnd');
      }
    };

    const startTimer = (duration, questionIndex) => {
      let remaining = duration;
      const timerInterval = setInterval(() => {
        client.emit('timerUpdate', { remaining, questionIndex });
        remaining--;

        if (remaining < 0) {
          clearInterval(timerInterval);
          if (questionIndex === quizz.questions.length - 1) {
            client.emit('quizzEnd');
          } else {
            sendQuestion();
          }
        }
      }, 1000);
    };

    sendQuestion();
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

  @SubscribeMessage('joinQuizzRoom')
  async joinQuizzRoom(client: Socket, { quizzId }: { quizzId: string }) {
    client.join(quizzId);
    client.emit('joinedQuizzRoom', {
      quizzId,
      message: 'Vous avez rejoint la salle du quiz.',
    });
  }

  @SubscribeMessage('quizStarted')
  async quizStarted(client: Socket, { quizzId }: { quizzId: string }) {
    this.server.to(quizzId).emit('quizStarted', { quizzId });
  }
}
