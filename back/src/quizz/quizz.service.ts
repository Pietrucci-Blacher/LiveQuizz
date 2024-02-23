import { Injectable } from '@nestjs/common';
import {
  Quizz,
  Question,
  QuestionNoCorrect,
} from './interfaces/quizz.interface';
import { Server } from 'socket.io';

@Injectable()
export class QuizzService {
  private server: Server;
  private quizzs: Quizz[] = [];

  createQuizz(quizzId: string, socketId: string, questions: Question[]) {
    const quizz: Quizz = this.getQuizzById(quizzId);
    if (quizz) return;

    const newQuizz: Quizz = {
      quizzId,
      socketIds: [],
      admin: socketId,
      questions,
      answeredQuestions: [],
    };
    this.quizzs.push(newQuizz);

    this.server.to(socketId).socketsJoin(quizzId);
    console.log('create a quizz', this.quizzs);
  }

  getQuizz(): Quizz[] {
    return this.quizzs;
  }

  getQuizzById(quizzId: string): Quizz {
    return this.quizzs.find((quizz) => quizz.quizzId === quizzId);
  }

  removeQuizz(quizzId: string) {
    const quizz: Quizz = this.getQuizzById(quizzId);
    if (!quizz) return;

    const { admin, socketIds } = quizz;

    this.server.to(admin).socketsLeave(quizzId);
    for (const socketId of socketIds)
      this.server.to(socketId).socketsLeave(quizzId);

    this.quizzs = this.quizzs.filter((quizz) => quizz.quizzId !== quizzId);
    console.log('remove quizz', this.quizzs);
  }

  setServer(server: Server) {
    this.server = server;
  }

  addUsersToQuizz(quizzId: string, socketId: string) {
    const quizz: Quizz = this.getQuizzById(quizzId);
    if (!quizz) return;
    if (quizz.socketIds.includes(socketId)) return;

    this.server.to(socketId).socketsJoin(quizzId);
    this.server.to(quizzId).emit('userJoinQuizz', 'user join quizz');

    quizz.socketIds.push(socketId);
    console.log('add user to quizz', this.quizzs);
  }

  removeUserFromQuizz(quizzId: string, socketId: string) {
    const quizz: Quizz = this.getQuizzById(quizzId);
    if (!quizz) return;

    const { admin, socketIds } = quizz;
    if (admin === socketId) return this.removeQuizz(quizzId);
    if (!socketIds.includes(socketId)) return;

    this.server.to(socketId).socketsLeave(quizzId);
    this.server.to(quizzId).emit('userLeaveQuizz', 'user leave quizz');

    quizz.socketIds = quizz.socketIds.filter((id) => id !== socketId);
    console.log('remove user from quizz', this.quizzs);
  }

  removeUserFromAllQuizz(socketId: string) {
    for (const quizz of this.quizzs)
      this.removeUserFromQuizz(quizz.quizzId, socketId);
  }

  getQuizzBySocketId(socketId: string): Quizz[] {
    return this.quizzs?.filter((quizz) => quizz.socketIds.includes(socketId));
  }

  getQuizzByAdminSocketId(socketId: string): Quizz {
    return this.quizzs?.find((quizz) => quizz.admin === socketId);
  }

  getQestionByQuizzId(quizzId: string, socketId: string): QuestionNoCorrect[] {
    const quizz: Quizz = this.getQuizzById(quizzId);
    if (!quizz) return;
    if (!quizz.socketIds.includes(socketId)) return;

    const { questions } = quizz;

    const newQuestions: QuestionNoCorrect[] = questions.map((question) => {
      const { answers, ...rest } = question;
      return { ...rest, answers: answers.map((answer) => answer.answer) };
    });

    console.log('get question by quizz id', newQuestions);
    return newQuestions;
  }

  answerQuestion(
    quizzId: string,
    socketId: string,
    question: string,
    answer: string,
  ): boolean {
    const quizz: Quizz = this.getQuizzById(quizzId);
    if (!quizz) return;
    console.log('answer question', quizz.socketIds, socketId);
    if (!quizz.socketIds.includes(socketId)) return;
    if (quizz.answeredQuestions.find((q) => q.socketId === socketId)) return;
    console.log('answer question', quizz.answeredQuestions);

    const { questions } = quizz;
    const currentQuestion = questions.find((q) => q.question === question);
    if (!currentQuestion) return;
    console.log('answer question', currentQuestion.answers, answer);

    const correctAnswer = currentQuestion.answers.find((a) => a.correct);
    if (!correctAnswer) return;
    console.log('answer question', correctAnswer.answer, answer);

    const isCorrect = correctAnswer.answer === answer;
    quizz.answeredQuestions.push({ socketId, question, answer, isCorrect });

    console.log('answer question', quizz.answeredQuestions);
    return isCorrect;
  }
}
