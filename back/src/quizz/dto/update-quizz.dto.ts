import { Question } from '../interfaces/quizz.interface';

export class UpdateQuizzDto {
  quizzId: string;
  questions: Question[];
}
