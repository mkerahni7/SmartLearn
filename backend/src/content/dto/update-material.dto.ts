import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialDTO } from './create-material.dto';
import { ApiProperty } from '@nestjs/swagger';
import { InputType, Field } from '@nestjs/graphql';

/**
 * UpdateMaterialDTO - Data Transfer Object for updating study materials
 * 
 * All fields are optional - only provided fields will be updated
 * Used for both REST API and GraphQL
 * 
 * @class UpdateMaterialDTO
 */
@InputType() // GraphQL input type
export class UpdateMaterialDTO extends PartialType(CreateMaterialDTO) {
  @ApiProperty({
    description: 'Material title',
    required: false,
  })
  @Field({ nullable: true }) // GraphQL field
  title?: string;

  @ApiProperty({
    description: 'Material description',
    required: false,
  })
  @Field({ nullable: true }) // GraphQL field
  description?: string;

  @ApiProperty({
    description: 'Tags',
    required: false,
  })
  @Field({ nullable: true }) // GraphQL field
  tags?: string;

  @ApiProperty({
    description: 'Whether material is public',
    required: false,
  })
  @Field({ nullable: true }) // GraphQL field
  isPublic?: boolean;
}

