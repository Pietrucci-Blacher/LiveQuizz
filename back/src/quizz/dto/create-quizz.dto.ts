import { Question } from '../interfaces/quizz.interface';

export class CreateQuizzDto {
  quizzId: string;
  questions: Question[];
}
