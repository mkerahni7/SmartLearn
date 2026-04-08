import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { ContentResolver } from './content.resolver';
import { StudyMaterial } from './entities/study-material.entity';
import { UsersModule } from '../users/users.module';
import { FlashcardsModule } from '../flashcards/flashcards.module';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { FileParserService } from './processors/file-parser.service';
import { FlashcardGeneratorService } from './processors/flashcard-generator.service';
import { QuizGeneratorService } from './processors/quiz-generator.service';

/**
 * ContentModule - Module for study materials management
 * 
 * Includes file upload, text extraction, and content generation (flashcards/quizzes)
 * 
 * @class ContentModule
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([StudyMaterial]),
    UsersModule,
    forwardRef(() => FlashcardsModule),
    forwardRef(() => QuizzesModule),
  ],
  controllers: [ContentController],
  providers: [
    ContentService,
    ContentResolver,
    FileParserService,
    FlashcardGeneratorService,
    QuizGeneratorService,
  ],
  exports: [ContentService],
})
export class ContentModule {}

