export interface Room {
  id: string;
  quizId: string;
  participants: Set<string>;
  quizState: 'waiting' | 'inProgress' | 'completed';
}
