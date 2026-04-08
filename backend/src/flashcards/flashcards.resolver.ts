import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';
import { Flashcard } from './entities/flashcard.entity';
import { CreateFlashcardDTO } from './dto/create-flashcard.dto';
import { UpdateFlashcardDTO } from './dto/update-flashcard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

/**
 * FlashcardsResolver - GraphQL API for flashcards
 * 
 * Provides GraphQL queries and mutations for flashcard management
 * All operations require JWT authentication
 * 
 * @class FlashcardsResolver
 */
@Resolver(() => Flashcard)
@UseGuards(JwtAuthGuard)
export class FlashcardsResolver {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  /**
   * Query: Get all flashcards for the authenticated user
   * 
   * @param {Object} context - GraphQL context (contains request with user)
   * @param {number} page - Page number (optional)
   * @param {number} limit - Results per page (optional)
   * @param {number} setId - Study material ID (optional)
   * @returns {Promise<Array<Flashcard>>} Array of flashcards
   */
  @Query(() => [Flashcard], { name: 'flashcards' })
  async getFlashcards(
    @Context() context: { req: { user: User } },
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('setId', { type: () => Int, nullable: true }) setId?: number,
  ): Promise<Flashcard[]> {
    const user = context.req.user;
    return this.flashcardsService.getFlashcards(user.id, { page, limit, setId });
  }

  /**
   * Query: Get a specific flashcard by ID
   * 
   * @param {Object} context - GraphQL context
   * @param {number} id - Flashcard ID
   * @returns {Promise<Flashcard>} Flashcard
   */
  @Query(() => Flashcard, { name: 'flashcard' })
  async getFlashcard(
    @Context() context: { req: { user: User } },
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Flashcard> {
    const user = context.req.user;
    return this.flashcardsService.getFlashcard(id, user.id);
  }

  /**
   * Query: Get flashcards for review (spaced repetition)
   * 
   * @param {Object} context - GraphQL context
   * @returns {Promise<Array<Flashcard>>} Flashcards ready for review
   */
  @Query(() => [Flashcard], { name: 'flashcardsForReview' })
  async getFlashcardsForReview(@Context() context: { req: { user: User } }): Promise<Flashcard[]> {
    const user = context.req.user;
    return this.flashcardsService.getFlashcardsForReview(user.id);
  }

  /**
   * Mutation: Create a new flashcard
   * 
   * @param {Object} context - GraphQL context
   * @param {CreateFlashcardDTO} createFlashcardDto - Flashcard data
   * @returns {Promise<Flashcard>} Created flashcard
   */
  @Mutation(() => Flashcard)
  async createFlashcard(
    @Context() context: { req: { user: User } },
    @Args('input') createFlashcardDto: CreateFlashcardDTO,
  ): Promise<Flashcard> {
    const user = context.req.user;
    return this.flashcardsService.createFlashcard(user.id, createFlashcardDto);
  }

  /**
   * Mutation: Update a flashcard
   * 
   * @param {Object} context - GraphQL context
   * @param {number} id - Flashcard ID
   * @param {UpdateFlashcardDTO} updateFlashcardDto - Update data
   * @returns {Promise<Flashcard>} Updated flashcard
   */
  @Mutation(() => Flashcard)
  async updateFlashcard(
    @Context() context: { req: { user: User } },
    @Args('id', { type: () => Int }) id: number,
    @Args('input') updateFlashcardDto: UpdateFlashcardDTO,
  ): Promise<Flashcard> {
    const user = context.req.user;
    return this.flashcardsService.updateFlashcard(id, user.id, updateFlashcardDto);
  }

  /**
   * Mutation: Delete a flashcard
   * 
   * @param {Object} context - GraphQL context
   * @param {number} id - Flashcard ID
   * @returns {Promise<boolean>} Success status
   */
  @Mutation(() => Boolean)
  async deleteFlashcard(
    @Context() context: { req: { user: User } },
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    const user = context.req.user;
    await this.flashcardsService.deleteFlashcard(id, user.id);
    return true;
  }
}

