import { Test, TestingModule } from '@nestjs/testing';
import { QuizzGateway } from './quizz.gateway';

describe('QuizzGateway', () => {
  let gateway: QuizzGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuizzGateway],
    }).compile();

    gateway = module.get<QuizzGateway>(QuizzGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
