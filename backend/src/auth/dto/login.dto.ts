import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

/**
 * LoginDTO - Data Transfer Object for user login
 * 
 * Validates login credentials
 * Used for both REST API and GraphQL
 * 
 * @class LoginDTO
 */
@InputType() // GraphQL input type
export class LoginDTO {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @Field() // GraphQL field
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Field() // GraphQL field
  password: string;
}

