import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, MinLength } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';

/**
 * CreateFlashcardDTO - Data Transfer Object for creating flashcards
 * 
 * Used for both REST API and GraphQL
 * 
 * @class CreateFlashcardDTO
 */
@InputType() // GraphQL input type
export class CreateFlashcardDTO {
  @ApiProperty({
    description: 'Front text of the flashcard (question)',
    example: 'What is React?',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'Front text must be at least 3 characters long' })
  @Field() // GraphQL field
  frontText: string;

  @ApiProperty({
    description: 'Back text of the flashcard (answer)',
    example: 'React is a JavaScript library for building user interfaces',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'Back text must be at least 3 characters long' })
  @Field() // GraphQL field
  backText: string;

  @ApiProperty({
    description: 'Study material ID (optional - links flashcard to a material)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true }) // GraphQL field
  studyMaterialId?: number;

  @ApiProperty({
    description: 'Difficulty level (1-3)',
    example: 1,
    minimum: 1,
    maximum: 3,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  @Field(() => Int, { nullable: true, defaultValue: 1 }) // GraphQL field
  difficultyLevel?: number;
}

