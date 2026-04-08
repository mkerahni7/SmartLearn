import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { Quiz } from './entities/quiz.entity';
import { CreateQuizDTO } from './dto/create-quiz.dto';
import { UpdateQuizDTO } from './dto/update-quiz.dto';
import { AddQuestionDTO } from './dto/add-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

/**
 * QuizzesResolver - GraphQL API for quizzes
 * 
 * Provides GraphQL queries and mutations for quiz management
 * All operations require JWT authentication
 * 
 * @class QuizzesResolver
 */
@Resolver(() => Quiz)
@UseGuards(JwtAuthGuard)
export class QuizzesResolver {
  constructor(private readonly quizzesService: QuizzesService) {}

  /**
   * Query: Get all quizzes for the authenticated user
   * 
   * @param {Object} context - GraphQL context (contains request with user)
   * @param {number} page - Page number (optional)
   * @param {number} limit - Results per page (optional)
   * @returns {Promise<Array<Quiz>>} Array of quizzes
   */
  @Query(() => [Quiz], { name: 'quizzes' })
  async getQuizzes(
    @Context() context: { req: { user: User } },
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<Quiz[]> {
    const user = context.req.user;
    return this.quizzesService.getQuizzes(user.id, { page, limit });
  }

  /**
   * Query: Get a specific quiz by ID
   * 
   * @param {Object} context - GraphQL context
   * @param {number} id - Quiz ID
   * @returns {Promise<Quiz>} Quiz with questions
   */
  @Query(() => Quiz, { name: 'quiz' })
  async getQuiz(
    @Context() context: { req: { user: User } },
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Quiz> {
    const user = context.req.user;
    return this.quizzesService.getQuiz(id, user.id);
  }

  /**
   * Mutation: Create a new quiz
   * 
   * @param {Object} context - GraphQL context
   * @param {CreateQuizDTO} createQuizDto - Quiz data
   * @returns {Promise<Quiz>} Created quiz
   */
  @Mutation(() => Quiz)
  async createQuiz(
    @Context() context: { req: { user: User } },
    @Args('input') createQuizDto: CreateQuizDTO,
  ): Promise<Quiz> {
    const user = context.req.user;
    return this.quizzesService.createQuiz(user.id, createQuizDto);
  }

  /**
   * Mutation: Update a quiz
   * 
   * @param {Object} context - GraphQL context
   * @param {number} id - Quiz ID
   * @param {UpdateQuizDTO} updateData - Update data
   * @returns {Promise<Quiz>} Updated quiz
   */
  @Mutation(() => Quiz)
  async updateQuiz(
    @Context() context: { req: { user: User } },
    @Args('id', { type: () => Int }) id: number,
    @Args('input') updateData: UpdateQuizDTO,
  ): Promise<Quiz> {
    const user = context.req.user;
    return this.quizzesService.updateQuiz(id, user.id, updateData);
  }

  /**
   * Mutation: Delete a quiz
   * 
   * @param {Object} context - GraphQL context
   * @param {number} id - Quiz ID
   * @returns {Promise<boolean>} Success status
   */
  @Mutation(() => Boolean)
  async deleteQuiz(
    @Context() context: { req: { user: User } },
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    const user = context.req.user;
    await this.quizzesService.deleteQuiz(id, user.id);
    return true;
  }

  /**
   * Mutation: Add a question to a quiz
   * 
   * @param {Object} context - GraphQL context
   * @param {number} quizId - Quiz ID
   * @param {AddQuestionDTO} addQuestionDto - Question data
   * @returns {Promise<Quiz>} Updated quiz
   */
  @Mutation(() => Quiz)
  async addQuestion(
    @Context() context: { req: { user: User } },
    @Args('quizId', { type: () => Int }) quizId: number,
    @Args('input') addQuestionDto: AddQuestionDTO,
  ): Promise<Quiz> {
    const user = context.req.user;
    await this.quizzesService.addQuestion(quizId, user.id, addQuestionDto);
    return this.quizzesService.getQuiz(quizId, user.id);
  }
}

