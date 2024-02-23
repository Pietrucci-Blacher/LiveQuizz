export interface Answer {
  answer: string;
  correct: boolean;
}

export interface Question {
  question: string;
  answers: Answer[];
}

export interface QuestionNoCorrect {
  question: string;
  answers: string[];
}

export interface AnsweredQuestion {
  socketId: string;
  question: string;
  answer: string;
  isCorrect: boolean;
}

export interface Quizz {
  socketIds: string[];
  admin: string;
  quizzId: string;
  questions: Question[];
  answeredQuestions?: AnsweredQuestion[];
}
