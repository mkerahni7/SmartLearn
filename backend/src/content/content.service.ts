import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { StudyMaterial } from './entities/study-material.entity';
import { CreateMaterialDTO } from './dto/create-material.dto';
import { UpdateMaterialDTO } from './dto/update-material.dto';
import { UsersService } from '../users/users.service';
import { QuizzesService } from '../quizzes/quizzes.service';
import { FlashcardsService } from '../flashcards/flashcards.service';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { Flashcard } from '../flashcards/entities/flashcard.entity';
import { FileParserService } from './processors/file-parser.service';
import { FlashcardGeneratorService } from './processors/flashcard-generator.service';
import { QuizGeneratorService } from './processors/quiz-generator.service';
import { CreateFlashcardDTO } from '../flashcards/dto/create-flashcard.dto';

/**
 * ContentService - Business logic for study materials
 * 
 * Handles CRUD operations, file processing, and content generation
 * 
 * @class ContentService
 */
@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(StudyMaterial)
    private readonly materialRepository: Repository<StudyMaterial>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => QuizzesService))
    private readonly quizzesService: QuizzesService,
    @Inject(forwardRef(() => FlashcardsService))
    private readonly flashcardsService: FlashcardsService,
    private readonly fileParserService: FileParserService,
    private readonly flashcardGeneratorService: FlashcardGeneratorService,
    private readonly quizGeneratorService: QuizGeneratorService,
  ) {}

  /**
   * Get all study materials for a user with pagination and filtering
   * 
   * @param {number} userId - User ID
   * @param {Object} options - Query options (page, limit, search, type)
   * @returns {Promise<Array<StudyMaterial>>} Array of study materials
   */
  async getAllMaterials(userId: number, options: { page?: number; limit?: number; search?: string; type?: string } = {}): Promise<StudyMaterial[]> {
    const { page = 1, limit = 20, search, type } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.materialRepository
      .createQueryBuilder('material')
      .where('material.userId = :userId', { userId })
      .orderBy('material.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (search) {
      queryBuilder.andWhere(
        '(material.title LIKE :search OR material.description LIKE :search OR material.tags LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      queryBuilder.andWhere('material.contentType = :type', { type });
    }

    return queryBuilder.getMany();
  }

  /**
   * Get a specific study material by ID
   * 
   * @param {number} id - Material ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<StudyMaterial>} Study material
   * @throws {NotFoundException} If material not found or not owned by user
   */
  async getMaterial(id: number, userId: number): Promise<StudyMaterial> {
    const material = await this.materialRepository.findOne({
      where: { id, userId },
    });

    if (!material) {
      throw new NotFoundException('Study material not found');
    }

    return material;
  }

  /**
   * Create a new study material
   * 
   * @param {number} userId - User ID
   * @param {CreateMaterialDTO} createMaterialDto - Material data
   * @returns {Promise<StudyMaterial>} Created study material
   */
  async createMaterial(userId: number, createMaterialDto: CreateMaterialDTO): Promise<StudyMaterial> {
    const { title, description, contentType, filePath, tags, isPublic } = createMaterialDto;

    if (!title) {
      throw new BadRequestException('Title is required');
    }

    const material = this.materialRepository.create({
      userId,
      title,
      description: description || '',
      contentType: contentType || 'note',
      filePath: filePath || null,
      tags: tags || JSON.stringify([]),
      isPublic: isPublic || false,
    });

    const savedMaterial = await this.materialRepository.save(material);

    // Add points for creating material
    await this.usersService.addPoints(userId, 10);

    return savedMaterial;
  }

  /**
   * Update an existing study material
   * 
   * @param {number} id - Material ID
   * @param {number} userId - User ID (for authorization)
   * @param {UpdateMaterialDTO} updateMaterialDto - Update data
   * @returns {Promise<StudyMaterial>} Updated study material
   * @throws {NotFoundException} If material not found or not owned by user
   */
  async updateMaterial(id: number, userId: number, updateMaterialDto: UpdateMaterialDTO): Promise<StudyMaterial> {
    const material = await this.getMaterial(id, userId);

    Object.assign(material, updateMaterialDto);
    return this.materialRepository.save(material);
  }

  /**
   * Delete a study material
   * 
   * @param {number} id - Material ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<void>}
   * @throws {NotFoundException} If material not found or not owned by user
   */
  async deleteMaterial(id: number, userId: number): Promise<void> {
    const material = await this.getMaterial(id, userId);
    await this.materialRepository.remove(material);
  }

  /**
   * Search study materials
   * 
   * @param {number} userId - User ID
   * @param {string} query - Search query
   * @returns {Promise<Array<StudyMaterial>>} Search results
   */
  async searchMaterials(userId: number, query: string): Promise<StudyMaterial[]> {
    return this.getAllMaterials(userId, { search: query, limit: 50 });
  }

  /**
   * Get materials by category (using tags)
   * 
   * @param {number} userId - User ID
   * @param {string} category - Category name
   * @returns {Promise<Array<StudyMaterial>>} Materials in category
   */
  async getMaterialsByCategory(userId: number, category: string): Promise<StudyMaterial[]> {
    return this.materialRepository.find({
      where: {
        userId,
        tags: Like(`%${category}%`),
      },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  /**
   * Share a study material (placeholder - would integrate with sharing system)
   * 
   * @param {number} id - Material ID
   * @param {number} userId - User ID
   * @param {Object} shareData - Share data
   * @returns {Promise<Object>} Share result
   */
  async shareMaterial(id: number, userId: number, shareData: { shareWith?: number; groupId?: number; permissionType?: string }): Promise<{ success: boolean; message: string }> {
    await this.getMaterial(id, userId); // Verify ownership

    // TODO: Implement sharing logic with shared_materials table
    return {
      success: true,
      message: 'Study material shared successfully',
    };
  }

  /**
   * Generate flashcards from a study material
   * 
   * @param {number} id - Material ID
   * @param {number} userId - User ID
   * @param {boolean} regenerate - Whether to regenerate existing flashcards
   * @returns {Promise<Array<Flashcard>>} Created flashcards
   */
  async generateFlashcards(id: number, userId: number, regenerate = false): Promise<Flashcard[]> {
    try {
      console.log(`📝 generateFlashcards called: materialId=${id}, userId=${userId}, regenerate=${regenerate}`);
      
      const material = await this.getMaterial(id, userId);
      console.log(`📝 Material found: ${material.title} (ID: ${id})`);

      // Extract text from file
      console.log(`📝 Extracting text from file...`);
      const extractedText = await this.fileParserService.extractText(material);
      const textToAnalyze = extractedText || material.description || material.title || '';

      console.log(`📝 Extracted text length: ${textToAnalyze.length} characters`);
      if (textToAnalyze.length < 50) {
        console.warn(`⚠️ Very short text extracted: "${textToAnalyze.substring(0, 100)}"`);
      }

      if (!textToAnalyze || textToAnalyze.trim().length < 20) {
        throw new BadRequestException(
          'Unable to generate flashcards: The material does not contain enough text. Please ensure the file has readable content or add a description.',
        );
      }

      // Generate flashcards
      console.log(`📝 Generating flashcards from ${textToAnalyze.length} characters of text...`);
      const generatedFlashcards = this.flashcardGeneratorService.generate(textToAnalyze, {
        material,
        maxCards: 10,
      });

      console.log(`📝 Generated ${generatedFlashcards.length} flashcards`);
      if (!generatedFlashcards.length) {
        throw new BadRequestException(
          'Unable to generate flashcards from the content. The material may not contain enough structured information. Try adding more descriptive text or a longer description.',
        );
      }

    // Convert to DTOs and save flashcards
    const flashcardDTOs: CreateFlashcardDTO[] = generatedFlashcards
      .filter((card) => {
        // Validate that front_text and back_text exist and are long enough
        const isValid = card.front_text && 
                       card.back_text && 
                       card.front_text.trim().length >= 3 && 
                       card.back_text.trim().length >= 3;
        if (!isValid) {
          console.warn(`⚠️ Skipping invalid flashcard:`, {
            front_text: card.front_text?.substring(0, 50),
            back_text: card.back_text?.substring(0, 50),
          });
        }
        return isValid;
      })
      .map((card) => {
        // Clean text to remove null bytes and invalid UTF-8 characters
        const cleanText = (text: string): string => {
          if (!text) return text;
          return text
            .replace(/\0/g, '') // Remove null bytes
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
            .trim();
        };

        return {
          frontText: cleanText(card.front_text),
          backText: cleanText(card.back_text),
          studyMaterialId: card.setId || material.id,
          difficultyLevel: card.difficultyLevel || 1,
        };
      });

    if (flashcardDTOs.length === 0) {
      throw new BadRequestException(
        'No valid flashcards could be generated from the content. Please ensure the material contains enough structured information.',
      );
    }

    console.log(`📝 Saving ${flashcardDTOs.length} flashcards to database...`);
    console.log(`📝 First flashcard DTO:`, JSON.stringify(flashcardDTOs[0], null, 2));
    
    // Check if flashcardsService is available
    if (!this.flashcardsService) {
      console.error('❌ FlashcardsService is not injected!');
      throw new BadRequestException('FlashcardsService is not available');
    }
    
    try {
      // Save flashcards using FlashcardsService
      const savedFlashcards = await this.flashcardsService.createFlashcards(userId, flashcardDTOs);
      console.log(`✅ Successfully saved ${savedFlashcards.length} flashcards`);
      return savedFlashcards;
    } catch (error) {
      console.error('❌ Error saving flashcards:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      // If it's already a BadRequestException, re-throw it
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Otherwise, wrap it
      throw new BadRequestException(
        `Failed to save flashcards: ${error.message || 'Unknown error'}`,
      );
    }
    } catch (error) {
      console.error('❌ generateFlashcards: Unexpected error:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      // If it's already a BadRequestException, re-throw it
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // For any other error, wrap it in a BadRequestException with a clear message
      throw new BadRequestException(
        `Failed to generate flashcards: ${error.message || 'Unknown error occurred. Please check the backend logs for details.'}`,
      );
    }
  }

  /**
   * Generate quiz from a study material
   * 
   * @param {number} id - Material ID
   * @param {number} userId - User ID
   * @returns {Promise<Quiz>} Created quiz with questions
   */
  async generateQuiz(id: number, userId: number): Promise<Quiz> {
    const material = await this.getMaterial(id, userId);

    // Extract text from file
    console.log(`📝 Generating quiz from material: ${material.title} (ID: ${id})`);
    const extractedText = await this.fileParserService.extractText(material);
    const textToAnalyze = extractedText || material.description || material.title || '';

    console.log(`📝 Extracted text length: ${textToAnalyze.length} characters`);
    if (textToAnalyze.length < 50) {
      console.warn(`⚠️ Very short text extracted: "${textToAnalyze.substring(0, 100)}"`);
    }

    if (!textToAnalyze || textToAnalyze.trim().length < 20) {
      throw new BadRequestException(
        'Unable to generate quiz: The material does not contain enough text. Please ensure the file has readable content or add a description.',
      );
    }

    // Generate quiz questions
    console.log(`📝 Generating quiz questions from ${textToAnalyze.length} characters of text...`);
    const generatedQuestions = this.quizGeneratorService.generate(textToAnalyze, {
      targetQuestions: 5,
    });

    console.log(`📝 Generated ${generatedQuestions.length} questions`);
    if (!generatedQuestions.length) {
      throw new BadRequestException(
        'Unable to generate quiz questions from the content. The material may not contain enough structured information. Try adding more descriptive text or a longer description.',
      );
    }

    // Create quiz with title based on material
    const quizTitle = `Quiz: ${material.title}`;
    const quizDescription = `Generated from ${material.title}`;

    const quiz = await this.quizzesService.createQuiz(userId, {
      title: quizTitle,
      description: quizDescription,
      timeLimit: null,
      isPublic: false,
    });

    // Add questions to the quiz
    console.log(`📝 Adding ${generatedQuestions.length} questions to quiz ${quiz.id}...`);
    for (let i = 0; i < generatedQuestions.length; i++) {
      const q = generatedQuestions[i];
      try {
        await this.quizzesService.addQuestion(quiz.id, userId, {
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        });
        console.log(`✅ Added question ${i + 1}/${generatedQuestions.length}`);
      } catch (error) {
        console.error(`❌ Error adding question ${i + 1}:`, error.message);
        // Continue with other questions even if one fails
      }
    }

    // Return the created quiz with questions
    console.log(`✅ Quiz generation complete for quiz ${quiz.id}`);
    return this.quizzesService.getQuiz(quiz.id, userId);
  }
}

