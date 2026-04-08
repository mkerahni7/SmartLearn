import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsBoolean, Min, MinLength } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';

/**
 * CreateQuizDTO - Data Transfer Object for creating quizzes
 * 
 * Used for both REST API and GraphQL
 * 
 * @class CreateQuizDTO
 */
@InputType() // GraphQL input type
export class CreateQuizDTO {
  @ApiProperty({
    description: 'Quiz title',
    example: 'React Fundamentals Quiz',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @Field() // GraphQL field
  title: string;

  @ApiProperty({
    description: 'Quiz description',
    example: 'Test your knowledge of React basics',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Field({ nullable: true }) // GraphQL field
  description?: string;

  @ApiProperty({
    description: 'Time limit in seconds',
    example: 600,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Field(() => Int, { nullable: true }) // GraphQL field
  timeLimit?: number;

  @ApiProperty({
    description: 'Whether quiz is public',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true, defaultValue: false }) // GraphQL field
  isPublic?: boolean;
}

