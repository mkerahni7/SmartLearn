import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, ArrayMinSize } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';

/**
 * SubmitQuizDTO - Data Transfer Object for submitting quiz answers
 * 
 * Used for REST API
 * 
 * @class SubmitQuizDTO
 */
@InputType() // GraphQL input type
export class SubmitQuizDTO {
  @ApiProperty({
    description: 'Array of answer indices (0-based) for each question',
    example: [0, 2, 1, 0],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one answer is required' })
  @IsInt({ each: true })
  @Field(() => [Int]) // GraphQL field
  answers: number[];
}

