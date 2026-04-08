import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

/**
 * UsersService - Business logic for user operations
 * 
 * Handles user CRUD operations, password management, and statistics
 * Uses TypeORM repository for database operations
 * 
 * @class UsersService
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  /**
   * Creates a new user in the database
   * Hashes password before storing
   * 
   * @param {RegisterDTO} userData - User registration data
   * @returns {Promise<User>} Created user (without password)
   * @throws {ConflictException} If email or username already exists
   */
  async create(userData: any): Promise<User> {
    // Check if email already exists
    const existingEmail = await this.userRepository.findOne({
      where: { email: userData.email },
    });
    if (existingEmail) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.findOne({
      where: { username: userData.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // Create user entity
    const user = this.userRepository.create({
      username: userData.username,
      email: userData.email,
      passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
    });

    // Save to database
    const savedUser = await this.userRepository.save(user);

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  /**
   * Finds user by email
   * 
   * @param {string} email - User email
   * @returns {Promise<User | null>} User if found, null otherwise
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Finds user by email with password hash (for authentication)
   * 
   * @param {string} email - User email
   * @returns {Promise<User | null>} User with password hash if found
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'username', 'email', 'passwordHash', 'firstName', 'lastName', 'avatarUrl', 'studyStreak', 'totalPoints', 'level', 'createdAt', 'updatedAt'],
    });
  }

  /**
   * Finds user by username
   * 
   * @param {string} username - Username
   * @returns {Promise<User | null>} User if found, null otherwise
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  /**
   * Finds user by ID
   * 
   * @param {number} id - User ID
   * @returns {Promise<User>} User object
   * @throws {NotFoundException} If user not found
   */
  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Updates user profile
   * 
   * @param {number} id - User ID
   * @param {UpdateProfileDTO} updateData - Profile update data
   * @returns {Promise<User>} Updated user
   * @throws {NotFoundException} If user not found
   * @throws {ConflictException} If email/username already taken
   */
  async updateProfile(id: number, updateData: any): Promise<User> {
    const user = await this.findById(id);

    // Check for email conflicts
    if (updateData.email && updateData.email !== user.email) {
      const existing = await this.findByEmail(updateData.email);
      if (existing) {
        throw new ConflictException('Email is already in use');
      }
    }

    // Check for username conflicts
    if (updateData.username && updateData.username !== user.username) {
      const existing = await this.findByUsername(updateData.username);
      if (existing) {
        throw new ConflictException('Username is already taken');
      }
    }

    // Update user fields
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  /**
   * Verifies password against hash
   * 
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} True if password matches
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generates JWT token for user
   * 
   * @param {User} user - User object
   * @returns {string} JWT token
   */
  generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
      { expiresIn: '7d' },
    );
  }

  /**
   * Verifies JWT token
   * 
   * @param {string} token - JWT token
   * @returns {any} Decoded token payload
   * @throws {Error} If token is invalid
   */
  verifyToken(token: string): any {
    return jwt.verify(
      token,
      this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
    );
  }

  /**
   * Gets comprehensive user statistics
   * 
   * @param {number} userId - User ID
   * @returns {Promise<any>} User statistics object
   */
  async getUserStats(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['studyMaterials', 'flashcards', 'quizzes'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Count related entities
    const totalMaterials = user.studyMaterials?.length || 0;
    const totalFlashcards = user.flashcards?.length || 0;
    const totalQuizzes = user.quizzes?.length || 0;

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      totalPoints: user.totalPoints,
      level: user.level,
      studyStreak: user.studyStreak,
      totalMaterials,
      totalFlashcards,
      totalQuizzes,
      totalQuizAttempts: 0, // TODO: Add quiz attempts relation
    };
  }

  /**
   * Adds points to user
   * 
   * @param {number} userId - User ID
   * @param {number} points - Points to add
   * @returns {Promise<User>} Updated user
   */
  async addPoints(userId: number, points: number): Promise<User> {
    const user = await this.findById(userId);
    user.totalPoints += points;

    // Check for level up (100 points per level)
    const newLevel = Math.floor(user.totalPoints / 100) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }

    return this.userRepository.save(user);
  }

  /**
   * Updates study streak
   * 
   * @param {number} userId - User ID
   * @param {number} streak - New streak value
   * @returns {Promise<User>} Updated user
   */
  async updateStudyStreak(userId: number, streak: number): Promise<User> {
    const user = await this.findById(userId);
    user.studyStreak = streak;
    return this.userRepository.save(user);
  }
}

