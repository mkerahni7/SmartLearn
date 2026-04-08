import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

/**
 * RegisterDTO - Data Transfer Object for user registration
 * 
 * Validates and structures registration data
 * Used for both REST API and GraphQL
 * 
 * @class RegisterDTO
 */
@InputType() // GraphQL input type
export class RegisterDTO {
  @ApiProperty({
    description: 'Unique username',
    example: 'johndoe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(50, { message: 'Username must not exceed 50 characters' })
  @Field() // GraphQL field
  username: string;

  @ApiProperty({
    description: 'Valid email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @Field() // GraphQL field
  email: string;

  @ApiProperty({
    description: 'Password (minimum 6 characters)',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Field() // GraphQL field
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Field({ nullable: true }) // GraphQL field
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Field({ nullable: true }) // GraphQL field
  lastName?: string;
}

