import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Flashcard } from './entities/flashcard.entity';
import { CreateFlashcardDTO } from './dto/create-flashcard.dto';
import { UpdateFlashcardDTO } from './dto/update-flashcard.dto';
import { UsersService } from '../users/users.service';

/**
 * FlashcardsService - Business logic for flashcard operations
 * 
 * Handles CRUD operations, study tracking, and spaced repetition
 * 
 * @class FlashcardsService
 */
@Injectable()
export class FlashcardsService {
  constructor(
    @InjectRepository(Flashcard)
    private readonly flashcardRepository: Repository<Flashcard>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Get all flashcards for a user with pagination and filtering
   * 
   * @param {number} userId - User ID
   * @param {Object} options - Query options (page, limit, setId, search)
   * @returns {Promise<Array<Flashcard>>} Array of flashcards
   */
  async getFlashcards(
    userId: number,
    options: { page?: number; limit?: number; setId?: number; search?: string } = {},
  ): Promise<Flashcard[]> {
    const { page = 1, limit = 20, setId, search } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.flashcardRepository
      .createQueryBuilder('flashcard')
      .where('flashcard.userId = :userId', { userId })
      .orderBy('flashcard.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (setId) {
      queryBuilder.andWhere('flashcard.studyMaterialId = :setId', { setId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(flashcard.frontText LIKE :search OR flashcard.backText LIKE :search)',
        { search: `%${search}%` },
      );
    }

    return queryBuilder.getMany();
  }

  /**
   * Get flashcards by set ID (study material ID)
   * 
   * @param {number} setId - Study material ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<Array<Flashcard>>} Array of flashcards
   */
  async getFlashcardsBySet(setId: number, userId: number): Promise<Flashcard[]> {
    return this.flashcardRepository.find({
      where: {
        studyMaterialId: setId,
        userId,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a specific flashcard by ID
   * 
   * @param {number} id - Flashcard ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<Flashcard>} Flashcard
   * @throws {NotFoundException} If flashcard not found or not owned by user
   */
  async getFlashcard(id: number, userId: number): Promise<Flashcard> {
    const flashcard = await this.flashcardRepository.findOne({
      where: { id, userId },
    });

    if (!flashcard) {
      throw new NotFoundException('Flashcard not found');
    }

    return flashcard;
  }

  /**
   * Create a new flashcard
   * 
   * @param {number} userId - User ID
   * @param {CreateFlashcardDTO} createFlashcardDto - Flashcard data
   * @returns {Promise<Flashcard>} Created flashcard
   */
  async createFlashcard(userId: number, createFlashcardDto: CreateFlashcardDTO): Promise<Flashcard> {
    const { frontText, backText, studyMaterialId, difficultyLevel } = createFlashcardDto;

    if (!frontText || !backText) {
      throw new BadRequestException('Front and back text are required');
    }

    // Clean text to remove null bytes and other invalid UTF-8 characters
    const cleanText = (text: string): string => {
      if (!text) return text;
      // Remove null bytes and other control characters except newlines and tabs
      return text
        .replace(/\0/g, '') // Remove null bytes
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove other control characters
        .trim();
    };

    const cleanedFrontText = cleanText(frontText);
    const cleanedBackText = cleanText(backText);

    if (!cleanedFrontText || !cleanedBackText) {
      throw new BadRequestException('Front and back text cannot be empty after cleaning');
    }

    const flashcard = this.flashcardRepository.create({
      userId,
      frontText: cleanedFrontText,
      backText: cleanedBackText,
      studyMaterialId: studyMaterialId || null,
      difficultyLevel: difficultyLevel || 1,
      timesReviewed: 0,
      correctAnswers: 0,
    });

    const savedFlashcard = await this.flashcardRepository.save(flashcard);

    // Add points for creating flashcard
    await this.usersService.addPoints(userId, 5);

    return savedFlashcard;
  }

  /**
   * Create multiple flashcards at once
   * 
   * @param {number} userId - User ID
   * @param {Array<CreateFlashcardDTO>} flashcardsData - Array of flashcard data
   * @returns {Promise<Array<Flashcard>>} Created flashcards
   */
  async createFlashcards(userId: number, flashcardsData: CreateFlashcardDTO[]): Promise<Flashcard[]> {
    const createdFlashcards: Flashcard[] = [];

    console.log(`📝 createFlashcards: Processing ${flashcardsData.length} flashcards for user ${userId}`);
    
    for (let i = 0; i < flashcardsData.length; i++) {
      const flashcardData = flashcardsData[i];
      try {
        console.log(`📝 Creating flashcard ${i + 1}/${flashcardsData.length}:`, {
          frontText: flashcardData.frontText?.substring(0, 50),
          backText: flashcardData.backText?.substring(0, 50),
          studyMaterialId: flashcardData.studyMaterialId,
          difficultyLevel: flashcardData.difficultyLevel,
        });
        
        const flashcard = await this.createFlashcard(userId, flashcardData);
        createdFlashcards.push(flashcard);
        console.log(`✅ Created flashcard ${i + 1} with ID: ${flashcard.id}`);
      } catch (error) {
        console.error(`❌ Error creating flashcard ${i + 1}:`, error);
        console.error(`❌ Flashcard data:`, JSON.stringify(flashcardData, null, 2));
        throw new BadRequestException(
          `Failed to create flashcard ${i + 1}: ${error.message || 'Unknown error'}`,
        );
      }
    }

    // Add bonus points for batch creation
    if (flashcardsData.length > 5) {
      await this.usersService.addPoints(userId, 10);
    }

    console.log(`✅ Successfully created ${createdFlashcards.length} flashcards`);
    return createdFlashcards;
  }

  /**
   * Update an existing flashcard
   * 
   * @param {number} id - Flashcard ID
   * @param {number} userId - User ID (for authorization)
   * @param {UpdateFlashcardDTO} updateFlashcardDto - Update data
   * @returns {Promise<Flashcard>} Updated flashcard
   * @throws {NotFoundException} If flashcard not found or not owned by user
   */
  async updateFlashcard(id: number, userId: number, updateFlashcardDto: UpdateFlashcardDTO): Promise<Flashcard> {
    const flashcard = await this.getFlashcard(id, userId);

    Object.assign(flashcard, updateFlashcardDto);
    return this.flashcardRepository.save(flashcard);
  }

  /**
   * Delete a flashcard
   * 
   * @param {number} id - Flashcard ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<void>}
   * @throws {NotFoundException} If flashcard not found or not owned by user
   */
  async deleteFlashcard(id: number, userId: number): Promise<void> {
    const flashcard = await this.getFlashcard(id, userId);
    await this.flashcardRepository.remove(flashcard);
  }

  /**
   * Delete all flashcards for a material (for regeneration)
   * 
   * @param {number} materialId - Study material ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<number>} Number of deleted flashcards
   */
  async deleteByMaterialId(materialId: number, userId: number): Promise<number> {
    const flashcards = await this.flashcardRepository.find({
      where: {
        studyMaterialId: materialId,
        userId,
      },
    });

    if (flashcards.length > 0) {
      await this.flashcardRepository.remove(flashcards);
    }

    return flashcards.length;
  }

  /**
   * Study a flashcard (mark as reviewed)
   * 
   * @param {number} id - Flashcard ID
   * @param {number} userId - User ID
   * @param {string} difficulty - Difficulty level (easy, medium, hard)
   * @returns {Promise<Object>} Study result with points earned
   */
  async studyFlashcard(id: number, userId: number, difficulty: 'easy' | 'medium' | 'hard'): Promise<{ flashcard: Flashcard; pointsEarned: number }> {
    const flashcard = await this.getFlashcard(id, userId);

    // Update review statistics
    flashcard.timesReviewed += 1;
    flashcard.lastReviewed = new Date();

    // Update correct answers if not easy (assumes user got it right)
    if (difficulty !== 'easy') {
      flashcard.correctAnswers += 1;
    }

    // Calculate next review date (simple spaced repetition)
    const daysUntilNextReview = difficulty === 'easy' ? 7 : difficulty === 'medium' ? 3 : 1;
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + daysUntilNextReview);
    flashcard.nextReview = nextReview;

    const updatedFlashcard = await this.flashcardRepository.save(flashcard);

    // Add points based on difficulty
    const points = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 5 : 8;
    await this.usersService.addPoints(userId, points);

    return {
      flashcard: updatedFlashcard,
      pointsEarned: points,
    };
  }

  /**
   * Get flashcards for review (spaced repetition)
   * 
   * @param {number} userId - User ID
   * @returns {Promise<Array<Flashcard>>} Flashcards ready for review
   */
  async getFlashcardsForReview(userId: number): Promise<Flashcard[]> {
    const now = new Date();

    return this.flashcardRepository.find({
      where: {
        userId,
      },
      order: { nextReview: 'ASC' },
      take: 20,
    });
  }

  /**
   * Get flashcard statistics
   * 
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Flashcard statistics
   */
  async getFlashcardStats(userId: number): Promise<{
    total: number;
    studied: number;
    due: number;
    sets: number;
    averageScore: number;
  }> {
    const flashcards = await this.flashcardRepository.find({
      where: { userId },
    });

    const now = new Date();
    const due = flashcards.filter((f) => !f.nextReview || f.nextReview <= now).length;
    const studied = flashcards.filter((f) => f.timesReviewed > 0).length;

    // Calculate unique sets
    const uniqueSets = new Set(flashcards.map((f) => f.studyMaterialId).filter((id) => id !== null));

    // Calculate average score
    const totalReviews = flashcards.reduce((sum, f) => sum + f.timesReviewed, 0);
    const totalCorrect = flashcards.reduce((sum, f) => sum + f.correctAnswers, 0);
    const averageScore = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

    return {
      total: flashcards.length,
      studied,
      due,
      sets: uniqueSets.size,
      averageScore,
    };
  }
}

