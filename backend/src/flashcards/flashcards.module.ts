import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardsService } from './flashcards.service';
import { FlashcardsController } from './flashcards.controller';
import { FlashcardsResolver } from './flashcards.resolver';
import { Flashcard } from './entities/flashcard.entity';
import { UsersModule } from '../users/users.module';

/**
 * FlashcardsModule - Module for flashcard management
 * 
 * Includes study tracking and spaced repetition
 * 
 * @class FlashcardsModule
 */
@Module({
  imports: [TypeOrmModule.forFeature([Flashcard]), UsersModule],
  controllers: [FlashcardsController],
  providers: [FlashcardsService, FlashcardsResolver],
  exports: [FlashcardsService],
})
export class FlashcardsModule {}

