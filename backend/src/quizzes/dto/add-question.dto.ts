import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsInt, IsOptional, Min, Max, ArrayMinSize, MinLength } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';

/**
 * AddQuestionDTO - Data Transfer Object for adding questions to quizzes
 * 
 * Used for REST API
 * 
 * @class AddQuestionDTO
 */
@InputType() // GraphQL input type
export class AddQuestionDTO {
  @ApiProperty({
    description: 'Question text',
    example: 'What is React?',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'Question text must be at least 3 characters long' })
  @Field() // GraphQL field
  question: string;

  @ApiProperty({
    description: 'Array of answer options',
    example: ['A JavaScript library', 'A framework', 'A database', 'A programming language'],
    minItems: 2,
  })
  @IsArray()
  @ArrayMinSize(2, { message: 'At least 2 options are required' })
  @IsString({ each: true })
  @Field(() => [String]) // GraphQL field
  options: string[];

  @ApiProperty({
    description: 'Index of the correct answer (0-based)',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Field(() => Int) // GraphQL field
  correctAnswer: number;

  @ApiProperty({
    description: 'Points for this question',
    example: 10,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Field(() => Int, { nullable: true, defaultValue: 1 }) // GraphQL field
  points?: number;
}

