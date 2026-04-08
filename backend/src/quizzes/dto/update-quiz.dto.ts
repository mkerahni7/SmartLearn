import { PartialType } from '@nestjs/mapped-types';
import { CreateQuizDTO } from './create-quiz.dto';
import { ApiProperty } from '@nestjs/swagger';
import { InputType, Field, Int } from '@nestjs/graphql';

/**
 * UpdateQuizDTO - Data Transfer Object for updating quizzes
 * 
 * All fields are optional - only provided fields will be updated
 * Used for both REST API and GraphQL
 * 
 * @class UpdateQuizDTO
 */
@InputType() // GraphQL input type
export class UpdateQuizDTO extends PartialType(CreateQuizDTO) {
  @ApiProperty({
    description: 'Quiz title',
    required: false,
  })
  @Field({ nullable: true }) // GraphQL field
  title?: string;

  @ApiProperty({
    description: 'Quiz description',
    required: false,
  })
  @Field({ nullable: true }) // GraphQL field
  description?: string;

  @ApiProperty({
    description: 'Time limit in seconds',
    required: false,
  })
  @Field(() => Int, { nullable: true }) // GraphQL field
  timeLimit?: number;

  @ApiProperty({
    description: 'Whether quiz is public',
    required: false,
  })
  @Field({ nullable: true }) // GraphQL field
  isPublic?: boolean;
}

