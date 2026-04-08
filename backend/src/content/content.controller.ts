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
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../config/multer.config';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { CreateMaterialDTO } from './dto/create-material.dto';
import { UpdateMaterialDTO } from './dto/update-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { StudyMaterial } from './entities/study-material.entity';

/**
 * ContentController - REST API endpoints for study materials
 * 
 * Handles file uploads, CRUD operations, search, and content generation
 * All endpoints require JWT authentication
 * 
 * @class ContentController
 */
@ApiTags('Content')
@ApiBearerAuth()
@Controller('api/content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  /**
   * GET /api/content
   * Get all study materials for the authenticated user
   * 
   * @param {User} user - Current authenticated user (from JWT)
   * @param {Object} query - Query parameters (page, limit, search, type)
   * @returns {Promise<Object>} Response with materials array
   */
  @Get()
  @ApiOperation({ summary: 'Get all study materials' })
  @ApiResponse({ status: 200, description: 'List of study materials', type: [StudyMaterial] })
  async getAllMaterials(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ) {
    const materials = await this.contentService.getAllMaterials(user.id, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search,
      type,
    });

    return {
      success: true,
      data: materials,
    };
  }

  /**
   * GET /api/content/search
   * Search study materials
   * 
   * @param {User} user - Current authenticated user
   * @param {string} q - Search query
   * @returns {Promise<Object>} Search results
   */
  @Get('search')
  @ApiOperation({ summary: 'Search study materials' })
  @ApiResponse({ status: 200, description: 'Search results', type: [StudyMaterial] })
  async searchMaterials(@CurrentUser() user: User, @Query('q') q: string) {
    if (!q) {
      throw new BadRequestException('Search query is required');
    }

    const materials = await this.contentService.searchMaterials(user.id, q);
    return {
      success: true,
      data: materials,
    };
  }

  /**
   * GET /api/content/category/:category
   * Get materials by category
   * 
   * @param {User} user - Current authenticated user
   * @param {string} category - Category name
   * @returns {Promise<Object>} Materials in category
   */
  @Get('category/:category')
  @ApiOperation({ summary: 'Get materials by category' })
  @ApiResponse({ status: 200, description: 'Materials in category', type: [StudyMaterial] })
  async getMaterialsByCategory(@CurrentUser() user: User, @Param('category') category: string) {
    const materials = await this.contentService.getMaterialsByCategory(user.id, category);
    return {
      success: true,
      data: materials,
    };
  }

  /**
   * GET /api/content/:id
   * Get a specific study material
   * 
   * @param {User} user - Current authenticated user
   * @param {number} id - Material ID
   * @returns {Promise<Object>} Study material
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific study material' })
  @ApiResponse({ status: 200, description: 'Study material', type: StudyMaterial })
  async getMaterial(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    const material = await this.contentService.getMaterial(id, user.id);
    return {
      success: true,
      data: material,
    };
  }

  /**
   * POST /content
   * Create a new study material (without file upload)
   * 
   * @param {User} user - Current authenticated user
   * @param {CreateMaterialDTO} createMaterialDto - Material data
   * @returns {Promise<Object>} Created material
   */
  @Post()
  @ApiOperation({ summary: 'Create a new study material' })
  @ApiResponse({ status: 201, description: 'Material created', type: StudyMaterial })
  async createMaterial(@CurrentUser() user: User, @Body() createMaterialDto: CreateMaterialDTO) {
    const material = await this.contentService.createMaterial(user.id, createMaterialDto);
    return {
      success: true,
      data: material,
      message: 'Study material created successfully',
    };
  }

  /**
   * POST /api/content/upload
   * Upload a file and create a study material
   * 
   * @param {User} user - Current authenticated user
   * @param {Express.Multer.File} file - Uploaded file
   * @param {string} title - Material title
   * @param {string} description - Material description
   * @returns {Promise<Object>} Created material with file
   */
  @Post('upload')
  @ApiOperation({ summary: 'Upload a file and create study material' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded and material created', type: StudyMaterial })
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('description') description?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!title) {
      throw new BadRequestException('Title is required');
    }

    // Create material with file info
    const contentType = file.mimetype.substring(0, 50);
    const material = await this.contentService.createMaterial(user.id, {
      title,
      description: description || '',
      contentType,
      filePath: file.path,
    });

    return {
      success: true,
      data: material,
      message: 'File uploaded successfully',
    };
  }

  /**
   * PUT /api/content/:id
   * Update a study material
   * 
   * @param {User} user - Current authenticated user
   * @param {number} id - Material ID
   * @param {UpdateMaterialDTO} updateMaterialDto - Update data
   * @returns {Promise<Object>} Updated material
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a study material' })
  @ApiResponse({ status: 200, description: 'Material updated', type: StudyMaterial })
  async updateMaterial(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMaterialDto: UpdateMaterialDTO,
  ) {
    const material = await this.contentService.updateMaterial(id, user.id, updateMaterialDto);
    return {
      success: true,
      data: material,
      message: 'Study material updated successfully',
    };
  }

  /**
   * DELETE /api/content/:id
   * Delete a study material
   * 
   * @param {User} user - Current authenticated user
   * @param {number} id - Material ID
   * @returns {Promise<Object>} Deletion result
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a study material' })
  @ApiResponse({ status: 200, description: 'Material deleted' })
  async deleteMaterial(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    await this.contentService.deleteMaterial(id, user.id);
    return {
      success: true,
      message: 'Study material deleted successfully',
    };
  }

  /**
   * POST /api/content/:id/generate/flashcards
   * Generate flashcards from a study material
   * 
   * @param {User} user - Current authenticated user
   * @param {number} id - Material ID
   * @param {string} regenerate - Whether to regenerate existing flashcards
   * @returns {Promise<Object>} Generated flashcards
   */
  @Post(':id/generate/flashcards')
  @ApiOperation({ summary: 'Generate flashcards from study material' })
  @ApiResponse({ status: 201, description: 'Flashcards generated' })
  async generateFlashcards(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Query('regenerate') regenerate?: string,
  ) {
    try {
      console.log(`📝 Controller: Generating flashcards for material ${id}, user ${user.id}`);
      const flashcards = await this.contentService.generateFlashcards(id, user.id, regenerate === 'true');
      console.log(`✅ Controller: Successfully generated ${flashcards.length} flashcards`);
      return {
        success: true,
        data: flashcards,
        message: `Successfully generated ${flashcards.length} flashcard${flashcards.length !== 1 ? 's' : ''}`,
      };
    } catch (error) {
      console.error('❌ Controller: Error generating flashcards:', error);
      console.error('❌ Controller: Error stack:', error.stack);
      // Re-throw to let NestJS handle it, but log it first
      throw error;
    }
  }

  /**
   * POST /api/content/:id/generate/quiz
   * Generate quiz from a study material
   * 
   * @param {User} user - Current authenticated user
   * @param {number} id - Material ID
   * @returns {Promise<Object>} Generated quiz questions
   */
  @Post(':id/generate/quiz')
  @ApiOperation({ summary: 'Generate quiz from study material' })
  @ApiResponse({ status: 201, description: 'Quiz generated' })
  @ApiResponse({ status: 400, description: 'Unable to generate quiz from content' })
  async generateQuiz(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    try {
      const quiz = await this.contentService.generateQuiz(id, user.id);
      return {
        success: true,
        data: quiz,
        message: 'Quiz generated successfully',
      };
    } catch (error) {
      console.error('❌ Error in generateQuiz controller:', error);
      throw error; // Re-throw to let NestJS handle it with proper status codes
    }
  }

  /**
   * POST /api/content/:id/share
   * Share a study material
   * 
   * @param {User} user - Current authenticated user
   * @param {number} id - Material ID
   * @param {Object} shareData - Share data
   * @returns {Promise<Object>} Share result
   */
  @Post(':id/share')
  @ApiOperation({ summary: 'Share a study material' })
  @ApiResponse({ status: 200, description: 'Material shared' })
  async shareMaterial(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() shareData: { shareWith?: number; groupId?: number; permissionType?: string },
  ) {
    const result = await this.contentService.shareMaterial(id, user.id, shareData);
    return {
      success: true,
      data: result,
      message: 'Study material shared successfully',
    };
  }
}

