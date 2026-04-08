import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDTO } from './dto/create-quiz.dto';
import { UpdateQuizDTO } from './dto/update-quiz.dto';
import { AddQuestionDTO } from './dto/add-question.dto';
import { SubmitQuizDTO } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Quiz } from './entities/quiz.entity';

/**
 * QuizzesController - REST API endpoints for quizzes
 * 
 * Handles CRUD operations, question management, and quiz attempts
 * All endpoints require JWT authentication
 * 
 * @class QuizzesController
 */
@ApiTags('Quizzes')
@ApiBearerAuth()
@Controller('api/quizzes')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  /**
   * GET /api/quizzes
   * Get all quizzes for the authenticated user
   * 
   * @param {User} user - Current authenticated user (from JWT)
   * @param {Object} query - Query parameters (page, limit, search, isPublic)
   * @returns {Promise<Object>} Response with quizzes array
   */
  @Get()
  @ApiOperation({ summary: 'Get all quizzes' })
  @ApiResponse({ status: 200, description: 'List of quizzes', type: [Quiz] })
  async getQuizzes(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('isPublic') isPublic?: string,
  ) {
    const quizzes = await this.quizzesService.getQuizzes(user.id, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search,
      isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
    });

    return {
      success: true,
      data: quizzes,
    };
  }

  /**
   * GET /api/quizzes/:id
   * Get a specific quiz with questions
   * 
   * @param {User} user - Current authenticated user
   * @param {number} id - Quiz ID
   * @param {string} shuffle - Query param to shuffle questions and options (shuffle=true)
   * @returns {Promise<Object>} Quiz with questions
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific quiz' })
  @ApiResponse({ status: 200, description: 'Quiz with questions', type: Quiz })
  async getQuiz(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Query('shuffle') shuffle?: string,
  ) {
    // Convert query param to boolean (shuffle=true or shuffle=1 means true)
    const shouldShuffle = shuffle === 'true' || shuffle === '1';
    const quiz = await this.quizzesService.getQuiz(id, user.id, shouldShuffle);
    return {
      success: true,
      data: quiz,
    };
  }

  /**
   * POST /api/quizzes
   * Create a new quiz
   * 
   * @param {User} user - Current authenticated user
   * @param {CreateQuizDTO} createQuizDto - Quiz data
   * @returns {Promise<Object>} Created quiz
   */
  @Post()
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiResponse({ status: 201, description: 'Quiz created', type: Quiz })
  async createQuiz(@CurrentUser() user: User, @Body() createQuizDto: CreateQuizDTO) {
    const quiz = await this.quizzesService.createQuiz(user.id, createQuizDto);
    return {
      success: true,
      data: quiz,
      message: 'Quiz created successfully',
    };
  }

  /**
   * PUT /api/quizzes/:id
   * Update a quiz
   * 
   * @param {User} user - Current authenticated user
   * @param {number} id - Quiz ID
   * @param {UpdateQuizDTO} updateData - Update data
   * @returns {Promise<Object>} Updated quiz
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a quiz' })
  @ApiResponse({ status: 200, description: 'Quiz updated', type: Quiz })
  async updateQuiz(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateQuizDTO,
  ) {
    const quiz = await this.quizzesService.updateQuiz(id, user.id, updateData);
    return {
      success: true,
      data: quiz,
      message: 'Quiz updated successfully',
    };
  }

  /**
   * DELETE /api/quizzes/:id
   * Delete a quiz
   * 
   * @param {User} user - Current authenticated user
   * @param {number} id - Quiz ID
   * @returns {Promise<Object>} Deletion result
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quiz' })
  @ApiResponse({ status: 200, description: 'Quiz deleted' })
  async deleteQuiz(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    await this.quizzesService.deleteQuiz(id, user.id);
    return {
      success: true,
      message: 'Quiz deleted successfully',
    };
  }

  /**
   * POST /api/quizzes/:id/questions
   * Add a question to a quiz
   * 
   * @param {User} user - Current authenticated user
   * @param {number} id - Quiz ID
   * @param {AddQuestionDTO} addQuestionDto - Question data
   * @returns {Promise<Object>} Created question
   */
  @Post(':id/questions')
  @ApiOperation({ summary: 'Add a question to a quiz' })
  @ApiResponse({ status: 201, description: 'Question added' })
  async addQuestion(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() addQuestionDto: AddQuestionDTO,
  ) {
    const question = await this.quizzesService.addQuestion(id, user.id, addQuestionDto);
    return {
      success: true,
      data: question,
      message: 'Question added successfully',
    };
  }

  /**
   * POST /api/quizzes/:id/start
   * Start a quiz attempt
   * 
   * @param {User} user - Current authenticated user
   * @param {number} id - Quiz ID
   * @returns {Promise<Object>} Quiz with time limit
   */
  @Post(':id/start')
  @ApiOperation({ summary: 'Start a quiz attempt' })
  @ApiResponse({ status: 200, description: 'Quiz started' })
  async startQuiz(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    const result = await this.quizzesService.startQuiz(id, user.id);
    return {
      success: true,
      data: result,
      message: 'Quiz started successfully',
    };
  }

  /**
   * POST /api/quizzes/:id/submit
   * Submit quiz answers
   * 
   * @param {User} user - Current authenticated user
   * @param {number} id - Quiz ID
   * @param {SubmitQuizDTO} submitQuizDto - User's answers
   * @returns {Promise<Object>} Quiz results
   */
  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit quiz answers' })
  @ApiResponse({ status: 200, description: 'Quiz submitted' })
  async submitQuiz(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() submitQuizDto: SubmitQuizDTO,
  ) {
    if (!submitQuizDto.answers || !Array.isArray(submitQuizDto.answers)) {
      throw new BadRequestException('Answers array is required');
    }

    const result = await this.quizzesService.submitQuiz(id, user.id, submitQuizDto.answers);
    return {
      success: true,
      data: result,
      message: 'Quiz submitted successfully',
    };
  }
}

