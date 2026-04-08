import { PartialType } from '@nestjs/mapped-types';
import { CreateFlashcardDTO } from './create-flashcard.dto';
import { ApiProperty } from '@nestjs/swagger';
import { InputType, Field, Int } from '@nestjs/graphql';

/**
 * UpdateFlashcardDTO - Data Transfer Object for updating flashcards
 * 
 * All fields are optional - only provided fields will be updated
 * Used for both REST API and GraphQL
 * 
 * @class UpdateFlashcardDTO
 */
@InputType() // GraphQL input type
export class UpdateFlashcardDTO extends PartialType(CreateFlashcardDTO) {
  @ApiProperty({
    description: 'Front text of the flashcard',
    required: false,
  })
  @Field({ nullable: true }) // GraphQL field
  frontText?: string;

  @ApiProperty({
    description: 'Back text of the flashcard',
    required: false,
  })
  @Field({ nullable: true }) // GraphQL field
  backText?: string;

  @ApiProperty({
    description: 'Difficulty level',
    required: false,
  })
  @Field(() => Int, { nullable: true }) // GraphQL field
  difficultyLevel?: number;
}

