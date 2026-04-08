import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

/**
 * UpdateProfileDTO - Data Transfer Object for profile updates
 * 
 * All fields are optional - only provided fields will be updated
 * Used for both REST API and GraphQL
 * 
 * @class UpdateProfileDTO
 */
@InputType() // GraphQL input type
export class UpdateProfileDTO {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Field({ nullable: true }) // GraphQL field
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Field({ nullable: true }) // GraphQL field
  lastName?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @Field({ nullable: true }) // GraphQL field
  email?: string;

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Field({ nullable: true }) // GraphQL field
  avatarUrl?: string;
}

