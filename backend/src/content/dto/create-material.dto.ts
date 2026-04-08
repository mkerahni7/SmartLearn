import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

/**
 * CreateMaterialDTO - Data Transfer Object for creating study materials
 * 
 * Used for both REST API and GraphQL
 * 
 * @class CreateMaterialDTO
 */
@InputType() // GraphQL input type
export class CreateMaterialDTO {
  @ApiProperty({
    description: 'Material title',
    example: 'Introduction to React',
    minLength: 3,
    maxLength: 200,
  })
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  @Field() // GraphQL field
  title: string;

  @ApiProperty({
    description: 'Material description',
    example: 'A comprehensive guide to React fundamentals',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Field({ nullable: true }) // GraphQL field
  description?: string;

  @ApiProperty({
    description: 'Content type (note, pdf, docx, pptx, txt)',
    example: 'pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Field({ nullable: true }) // GraphQL field
  contentType?: string;

  @ApiProperty({
    description: 'File path (for uploaded files)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Field({ nullable: true }) // GraphQL field
  filePath?: string;

  @ApiProperty({
    description: 'Tags (comma-separated)',
    example: 'react,frontend,javascript',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Field({ nullable: true }) // GraphQL field
  tags?: string;

  @ApiProperty({
    description: 'Whether material is public',
    example: false,
    required: false,
  })
  @IsOptional()
  @Field({ nullable: true, defaultValue: false }) // GraphQL field
  isPublic?: boolean;
}

