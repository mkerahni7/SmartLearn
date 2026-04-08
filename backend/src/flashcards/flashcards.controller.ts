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
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDTO } from './dto/create-flashcard.dto';
import { UpdateFlashcardDTO } from './dto/update-flashcard.dto';
import { StudyFlashcardDTO } from './dto/study-flashcard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Flashcard } from './entities/flashcard.entity';

/**
 * FlashcardsController - REST API endpoints for flashcards
 * 
 * Handles CRUD operations, study tracking, and statistics
 * All endpoints require JWT authentication
 * 
 * @class FlashcardsController
 */
@ApiTags('Flashcards')
@ApiBearerAuth()
@Controller('api/flashcards')
@UseGuards(JwtAuthGuard)
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  /**
   * GET /api/flashcards
   * Get all flashcards for the authenticated user
   * 
   * @param {User} user - Current authenticated user (from JWT)
   * @param {Object} query - Query parameters (page, limit, setId, search)
   * @returns {Promise<Object>} Response with flashcards array
   */
  @Get()
  @ApiOperation({ summary: 'Get all flashcards' })
  @ApiResponse({ status: 200, description: 'List of flashcards', type: [Flashcard] })
  async getFlashcards(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('setId') setId?: string,
    @Query('search') search?: string,
  ) {
    const flashcards = await this.flashcardsService.getFlashcards(user.id, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      setId: setId ? parseInt(setId) : undefined,
      search,
    });

    return {
      success: true,
      data: flashcards,
    };
  }

  /**
   * GET /api/flashcards/set/:setId
   * Get flashcards by set ID
   * 
   * @param {User} user - Current authenticated user
   * @param {number} setId - Study material ID
   * @returns {Promise<Object>} Flashcards in the set
   */
  @Get('set/:setId')
  @ApiOperation({ summary: 'Get flashcards by set ID' })
  @ApiResponse({ status: 200, description: 'Flashcards in set', type: [Flashcard] })
  async getFlashcardsBySet(@CurrentUser() user: User, @Param('setId', ParseIntPipe) setId: number) {
    const flashcards = await this.flashcardsService.getFlashcardsBySet(setId, user.id);
    return {
      success: true,
      data: flashcards,
    };
  }

  /**
   * GET /api/flashcards/review
   * Get flashcards for review (spaced repetition)
   * 
   * @param {User} user - Current authenticated user
   * @returns {Promise<Object>} Flashcards ready for review
   */
  @Get('review')
  @ApiOperation({ summary: 'Get flashcards for review' })
  @ApiResponse({ status: 200, description: 'Flashcards ready for review', type: [Flashcard] })
  async getFlashcardsForReview(@CurrentUser() user: User) {
    const flashcards = await this.flashcardsService.getFlashcardsForReview(user.id);
    return {
      success: true,
      data: flashcards,
    };
  }

  /**
   * GET /api/flashcards/stats
   * Get flashcard statistics
   * 
   * @param {User} user - Current authenticated user
   * @returns {Promise<Object>} Flashcard statistics
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get flashcard statistics' })
  @ApiResponse({ status: 200, description: 'Flashcard statistics' })
  async getFlashcardStats(@CurrentUser() user: User) {
    const stats = await this.flashcardsService.getFlashcardStats(user.id);
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * GET /api/flashcards/:id
   * Get a specific flashcard
   * 
   * @param {User} user - Current authenticated user
   * @param {number} id - Flashcard ID
   * @returns {Promise<Object>} Flashcard
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific flashcard' })
  @ApiResponse({ status: 200, description: 'Flashcard', type: Flashcard })
  async getFlashcard(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    const flashcard = await this.flashcardsService.getFlashcard(id, user.id);
    return {
      success: true,
      data: flashcard,
    };
  }

  /**
   * POST /api/flashcards
   * Create a new flashcard
   * 
   * @param {User} user - Current authenticated user
   * @param {CreateFlashcardDTO} createFlashcardDto - Flashcard data
   * @returns {Promise<Object>} Created flashcard
   */
  @Post()
  @ApiOperation({ summary: 'Create a new flashcard' })
  @ApiResponse({ status: 201, description: 'Flashcard created', type: Flashcard })
  async createFlashcard(@CurrentUser() user: User, @Body() createFlashcardDto: CreateFlashcardDTO) {
    const flashcard = await this.flashcardsService.createFlashcard(user.id, createFlashcardDto);
    return {
      success: true,
      data: flashcard,
      message: 'Flashcard created successfully',
    };
  }

  /**
   * POST /api/flashcards/batch
   * Create multiple flashcards at once
   * 
   * @param {User} user - Current authenticated user
   * @param {Object} body - Request body with flashcards array
   * @returns {Promise<Object>} Created flashcards
   */
  @Post('batch')
  @ApiOperation({ summary: 'Create multiple flashcards' })
  @ApiResponse({ status: 201, description: 'Flashcards created', type: [Flashcard] })
  async createFlashcards(
    @CurrentUser() user: User,
    @Body('flashcards') flashcards: CreateFlashcardDTO[],
  ) {
    if (!flashcards || !Array.isArray(flashcards)) {
      throw new BadRequestException('Flashcards array is required');
    }

    const createdFlashcards = await this.flashcardsService.createFlashcards(user.id, flashcards);
    return {
      success: true,
      data: createdFlashcards,
      message: `${createdFlashcards.length} flashcards created successfully`,
    };
  }

  /**
   * PUT /api/flashcards/:id
   * Update a flashcard
   * 
   * @param {User} user - Current authenticated user
   * @param {number} id - Flashcard ID
   * @param {UpdateFlashcardDTO} updateFlashcardDto - Update data
   * @returns {Promise<Object>} Updated flashcard
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a flashcard' })
  @ApiResponse({ status: 200, description: 'Flashcard updated', type: Flashcard })
  async updateFlashcard(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFlashcardDto: UpdateFlashcardDTO,
  ) {
    const flashcard = await this.flashcardsService.updateFlashcard(id, user.id, updateFlashcardDto);
    return {
      success: true,
      data: flashcard,
      message: 'Flashcard updated successfully',
    };
  }

  /**
   * DELETE /api/flashcards/:id
   * Delete a flashcard
   * 
   * @param {User} user - Current authenticated user
   * @param {number} id - Flashcard ID
   * @returns {Promise<Object>} Deletion result
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a flashcard' })
  @ApiResponse({ status: 200, description: 'Flashcard deleted' })
  async deleteFlashcard(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    await this.flashcardsService.deleteFlashcard(id, user.id);
    return {
      success: true,
      message: 'Flashcard deleted successfully',
    };
  }

  /**
   * POST /api/flashcards/:id/study
   * Study a flashcard (mark as reviewed)
   * 
   * @param {User} user - Current authenticated user
   * @param {number} id - Flashcard ID
   * @param {StudyFlashcardDTO} studyFlashcardDto - Study data
   * @returns {Promise<Object>} Study result
   */
  @Post(':id/study')
  @ApiOperation({ summary: 'Study a flashcard' })
  @ApiResponse({ status: 200, description: 'Flashcard studied' })
  async studyFlashcard(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() studyFlashcardDto: StudyFlashcardDTO,
  ) {
    const result = await this.flashcardsService.studyFlashcard(id, user.id, studyFlashcardDto.difficulty);
    return {
      success: true,
      data: result,
      message: 'Flashcard studied successfully',
    };
  }
}

