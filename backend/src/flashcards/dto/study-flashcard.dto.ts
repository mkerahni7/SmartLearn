import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

/**
 * StudyFlashcardDTO - Data Transfer Object for studying flashcards
 * 
 * Used for REST API to track flashcard study sessions
 * 
 * @class StudyFlashcardDTO
 */
@InputType() // GraphQL input type
export class StudyFlashcardDTO {
  @ApiProperty({
    description: 'Difficulty level of the study session',
    example: 'easy',
    enum: ['easy', 'medium', 'hard'],
  })
  @IsString()
  @IsIn(['easy', 'medium', 'hard'], { message: 'Difficulty must be easy, medium, or hard' })
  @Field() // GraphQL field
  difficulty: 'easy' | 'medium' | 'hard';
}

