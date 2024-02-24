import { Injectable } from '@nestjs/common';
import {
  Quizz,
  Question,
  QuestionNoCorrect,
  Answer,
  AnsweredQuestion,
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
    for (const socketId of socketIds) {
      this.server.to(socketId).emit('quizzEnd', { quizzId });
      this.server.to(socketId).socketsLeave(quizzId);
    }

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
    if (!quizz.socketIds.includes(socketId)) return;
    if (
      quizz.answeredQuestions.find(
        (q) => q.socketId === socketId && q.question == question,
      )
    )
      return;

    const { questions } = quizz;
    const currentQuestion: Question = questions.find(
      (q) => q.question === question,
    );
    if (!currentQuestion) return;

    const correctAnswer: Answer = currentQuestion.answers.find(
      (a) => a.correct,
    );
    if (!correctAnswer) return;

    const isCorrect: boolean = correctAnswer.answer === answer;
    const newAnsweredQuestion: AnsweredQuestion = {
      socketId,
      question,
      answer,
      isCorrect,
    };
    quizz.answeredQuestions.push(newAnsweredQuestion);

    this.server.to(quizz.admin).emit('userAnswerQuestion', newAnsweredQuestion);

    console.log('answer a questions', this.quizzs);
    return isCorrect;
  }

  getResultsBySocketId(quizzId: string, socketId: string): AnsweredQuestion[] {
    const quizz: Quizz = this.getQuizzById(quizzId);
    if (!quizz) return;
    if (!quizz.socketIds.includes(socketId)) return;

    const { answeredQuestions } = quizz;
    return answeredQuestions.filter((q) => q.socketId === socketId);
  }

  getResults(quizzId: string): AnsweredQuestion[] {
    const quizz: Quizz = this.getQuizzById(quizzId);
    if (!quizz) return;

    return quizz.answeredQuestions;
  }
}