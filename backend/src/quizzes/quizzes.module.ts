import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { QuizzesResolver } from './quizzes.resolver';
import { Quiz } from './entities/quiz.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { UsersModule } from '../users/users.module';

/**
 * QuizzesModule - Module for quiz management
 * 
 * Includes question management and quiz attempts
 * 
 * @class QuizzesModule
 */
@Module({
  imports: [TypeOrmModule.forFeature([Quiz, QuizQuestion]), UsersModule],
  controllers: [QuizzesController],
  providers: [QuizzesService, QuizzesResolver],
  exports: [QuizzesService],
})
export class QuizzesModule {}

