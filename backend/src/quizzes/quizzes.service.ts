import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { CreateQuizDTO } from './dto/create-quiz.dto';
import { UpdateQuizDTO } from './dto/update-quiz.dto';
import { AddQuestionDTO } from './dto/add-question.dto';
import { UsersService } from '../users/users.service';

/**
 * QuizzesService - Business logic for quiz operations
 * 
 * Handles CRUD operations, question management, and quiz attempts
 * 
 * @class QuizzesService
 */
@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(QuizQuestion)
    private readonly questionRepository: Repository<QuizQuestion>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Get all quizzes for a user with pagination and filtering
   * 
   * @param {number} userId - User ID
   * @param {Object} options - Query options (page, limit, search, isPublic)
   * @returns {Promise<Array<Quiz>>} Array of quizzes
   */
  async getQuizzes(
    userId: number,
    options: { page?: number; limit?: number; search?: string; isPublic?: boolean } = {},
  ): Promise<Quiz[]> {
    const { page = 1, limit = 20, search, isPublic } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.quizRepository
      .createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.questions', 'questions')
      .where('quiz.userId = :userId', { userId })
      .orderBy('quiz.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (search) {
      queryBuilder.andWhere('(quiz.title LIKE :search OR quiz.description LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (isPublic !== undefined) {
      queryBuilder.andWhere('quiz.isPublic = :isPublic', { isPublic });
    }

    return queryBuilder.getMany();
  }

  /**
   * Get a specific quiz by ID with questions
   * 
   * @param {number} id - Quiz ID
   * @param {number} userId - User ID (for authorization)
   * @param {boolean} shuffle - Whether to shuffle questions and options for variety
   * @returns {Promise<Quiz>} Quiz with questions
   * @throws {NotFoundException} If quiz not found or not owned by user
   */
  async getQuiz(id: number, userId: number, shuffle: boolean = false): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id, userId },
      relations: ['questions'],
      order: { questions: { orderIndex: 'ASC' } },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Shuffle questions and options for variety if requested
    if (shuffle && quiz.questions && quiz.questions.length > 0) {
      quiz.questions = this.shuffleQuestions(quiz.questions);
    }

    return quiz;
  }

  /**
   * Shuffle questions and their answer options for variety
   * Maintains correct answer tracking by updating correctAnswer to match shuffled position
   * 
   * @param {QuizQuestion[]} questions - Array of quiz questions
   * @returns {QuizQuestion[]} Shuffled questions with shuffled options
   */
  private shuffleQuestions(questions: QuizQuestion[]): QuizQuestion[] {
    // Shuffle the order of questions
    const shuffledQuestions = [...questions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }

    // Shuffle options for each question
    return shuffledQuestions.map((question) => {
      try {
        // Parse options from JSON string
        const options = question.options 
          ? (typeof question.options === 'string' 
              ? JSON.parse(question.options) 
              : question.options)
          : [];

        if (!Array.isArray(options) || options.length === 0) {
          return question; // Return unchanged if no options
        }

        // Find the current correct answer text
        const correctAnswerText = question.correctAnswer;

        // Shuffle the options array
        const shuffledOptions = [...options];
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }

        // Find the new index of the correct answer after shuffling
        const newCorrectIndex = shuffledOptions.findIndex(
          (opt) => opt === correctAnswerText || String(opt) === String(correctAnswerText)
        );

        // Create a new question object with shuffled options
        const shuffledQuestion = { ...question };
        shuffledQuestion.options = JSON.stringify(shuffledOptions);
        
        // Update correctAnswer to be the text (not index) - frontend will match by text
        // The correct answer text remains the same, just its position in options changes
        shuffledQuestion.correctAnswer = correctAnswerText;

        return shuffledQuestion;
      } catch (error) {
        console.error('Error shuffling question options:', error);
        return question; // Return unchanged on error
      }
    });
  }

  /**
   * Create a new quiz
   * 
   * @param {number} userId - User ID
   * @param {CreateQuizDTO} createQuizDto - Quiz data
   * @returns {Promise<Quiz>} Created quiz
   */
  async createQuiz(userId: number, createQuizDto: CreateQuizDTO): Promise<Quiz> {
    const { title, description, timeLimit, isPublic } = createQuizDto;

    if (!title) {
      throw new BadRequestException('Title is required');
    }

    const quiz = this.quizRepository.create({
      userId,
      title,
      description: description || '',
      timeLimit: timeLimit || null,
      isPublic: isPublic || false,
      totalQuestions: 0,
    });

    return this.quizRepository.save(quiz);
  }

  /**
   * Update an existing quiz
   * 
   * @param {number} id - Quiz ID
   * @param {number} userId - User ID (for authorization)
   * @param {UpdateQuizDTO} updateData - Update data
   * @returns {Promise<Quiz>} Updated quiz
   * @throws {NotFoundException} If quiz not found or not owned by user
   */
  async updateQuiz(id: number, userId: number, updateData: UpdateQuizDTO): Promise<Quiz> {
    const quiz = await this.getQuiz(id, userId);

    Object.assign(quiz, updateData);
    return this.quizRepository.save(quiz);
  }

  /**
   * Delete a quiz
   * 
   * @param {number} id - Quiz ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<void>}
   * @throws {NotFoundException} If quiz not found or not owned by user
   */
  async deleteQuiz(id: number, userId: number): Promise<void> {
    const quiz = await this.getQuiz(id, userId);
    await this.quizRepository.remove(quiz);
  }

  /**
   * Add a question to a quiz
   * 
   * @param {number} quizId - Quiz ID
   * @param {number} userId - User ID (for authorization)
   * @param {AddQuestionDTO} addQuestionDto - Question data
   * @returns {Promise<QuizQuestion>} Created question
   */
  async addQuestion(quizId: number, userId: number, addQuestionDto: AddQuestionDTO): Promise<QuizQuestion> {
    const quiz = await this.getQuiz(quizId, userId);

    const { question, options, correctAnswer, points } = addQuestionDto;

    if (!question || !options || options.length < 2) {
      throw new BadRequestException('Question text and at least 2 options are required');
    }

    if (correctAnswer < 0 || correctAnswer >= options.length) {
      throw new BadRequestException('Correct answer index is out of range');
    }

    // Get the correct answer text from options
    const correctAnswerText = options[correctAnswer];

    // Get current question count for order index
    const questionCount = await this.questionRepository.count({
      where: { quizId },
    });

    const quizQuestion = this.questionRepository.create({
      quizId,
      questionText: question,
      questionType: 'multiple_choice',
      correctAnswer: correctAnswerText,
      options: JSON.stringify(options),
      points: points || 1,
      orderIndex: questionCount,
    });

    const savedQuestion = await this.questionRepository.save(quizQuestion);

    // Update quiz total questions count
    quiz.totalQuestions = questionCount + 1;
    await this.quizRepository.save(quiz);

    // Add points for creating question
    await this.usersService.addPoints(userId, 10);

    return savedQuestion;
  }

  /**
   * Start a quiz attempt
   * 
   * @param {number} quizId - Quiz ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Quiz with time limit
   */
  async startQuiz(quizId: number, userId: number): Promise<{ quiz: Quiz; timeLimit?: number }> {
    const quiz = await this.getQuiz(quizId, userId);

    return {
      quiz,
      timeLimit: quiz.timeLimit || undefined,
    };
  }

  /**
   * Submit quiz answers and calculate score
   * 
   * @param {number} quizId - Quiz ID
   * @param {number} userId - User ID
   * @param {Array<number>} answers - User's answers (array of option indices)
   * @returns {Promise<Object>} Quiz results
   */
  async submitQuiz(quizId: number, userId: number, answers: number[]): Promise<{
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    pointsEarned: number;
  }> {
    const quiz = await this.getQuiz(quizId, userId);

    if (!quiz.questions || quiz.questions.length === 0) {
      throw new BadRequestException('Quiz has no questions');
    }

    if (answers.length !== quiz.questions.length) {
      throw new BadRequestException('Number of answers must match number of questions');
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question, index) => {
      const userAnswerIndex = answers[index];
      const options = JSON.parse(question.options || '[]');
      const userAnswerText = options[userAnswerIndex];

      if (userAnswerText === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Add points based on score (5 points per 10% score)
    const pointsEarned = Math.round(score / 10) * 5;
    await this.usersService.addPoints(userId, pointsEarned);

    return {
      score,
      correctAnswers,
      totalQuestions,
      pointsEarned,
    };
  }
}

