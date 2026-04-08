import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';

/**
 * SearchMaterialDTO - Data Transfer Object for searching materials
 * 
 * Used for REST API search endpoint
 * 
 * @class SearchMaterialDTO
 */
export class SearchMaterialDTO {
  @ApiProperty({
    description: 'Search query string',
    example: 'react hooks',
  })
  @IsString()
  q: string;

  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Results per page',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

