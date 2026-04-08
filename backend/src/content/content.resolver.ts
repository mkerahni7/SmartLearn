import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { StudyMaterial } from './entities/study-material.entity';
import { CreateMaterialDTO } from './dto/create-material.dto';
import { UpdateMaterialDTO } from './dto/update-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

/**
 * ContentResolver - GraphQL API for study materials
 * 
 * Provides GraphQL queries and mutations for content management
 * All operations require JWT authentication
 * 
 * @class ContentResolver
 */
@Resolver(() => StudyMaterial)
@UseGuards(JwtAuthGuard)
export class ContentResolver {
  constructor(private readonly contentService: ContentService) {}

  /**
   * Query: Get all study materials for the authenticated user
   * 
   * @param {Object} context - GraphQL context (contains request with user)
   * @param {number} page - Page number (optional)
   * @param {number} limit - Results per page (optional)
   * @returns {Promise<Array<StudyMaterial>>} Array of study materials
   */
  @Query(() => [StudyMaterial], { name: 'materials' })
  async getMaterials(
    @Context() context: { req: { user: User } },
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<StudyMaterial[]> {
    const user = context.req.user;
    return this.contentService.getAllMaterials(user.id, { page, limit });
  }

  /**
   * Query: Get a specific study material by ID
   * 
   * @param {Object} context - GraphQL context
   * @param {number} id - Material ID
   * @returns {Promise<StudyMaterial>} Study material
   */
  @Query(() => StudyMaterial, { name: 'material' })
  async getMaterial(
    @Context() context: { req: { user: User } },
    @Args('id', { type: () => Int }) id: number,
  ): Promise<StudyMaterial> {
    const user = context.req.user;
    return this.contentService.getMaterial(id, user.id);
  }

  /**
   * Mutation: Create a new study material
   * 
   * @param {Object} context - GraphQL context
   * @param {CreateMaterialDTO} createMaterialDto - Material data
   * @returns {Promise<StudyMaterial>} Created material
   */
  @Mutation(() => StudyMaterial)
  async createMaterial(
    @Context() context: { req: { user: User } },
    @Args('input') createMaterialDto: CreateMaterialDTO,
  ): Promise<StudyMaterial> {
    const user = context.req.user;
    return this.contentService.createMaterial(user.id, createMaterialDto);
  }

  /**
   * Mutation: Update a study material
   * 
   * @param {Object} context - GraphQL context
   * @param {number} id - Material ID
   * @param {UpdateMaterialDTO} updateMaterialDto - Update data
   * @returns {Promise<StudyMaterial>} Updated material
   */
  @Mutation(() => StudyMaterial)
  async updateMaterial(
    @Context() context: { req: { user: User } },
    @Args('id', { type: () => Int }) id: number,
    @Args('input') updateMaterialDto: UpdateMaterialDTO,
  ): Promise<StudyMaterial> {
    const user = context.req.user;
    return this.contentService.updateMaterial(id, user.id, updateMaterialDto);
  }

  /**
   * Mutation: Delete a study material
   * 
   * @param {Object} context - GraphQL context
   * @param {number} id - Material ID
   * @returns {Promise<boolean>} Success status
   */
  @Mutation(() => Boolean)
  async deleteMaterial(
    @Context() context: { req: { user: User } },
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    const user = context.req.user;
    await this.contentService.deleteMaterial(id, user.id);
    return true;
  }
}

