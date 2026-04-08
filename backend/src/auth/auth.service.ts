import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import * as bcrypt from 'bcryptjs';

/**
 * AuthService - Business logic for authentication
 * 
 * Handles user registration, login, token generation, and profile updates
 * Uses UsersService for user operations and JwtService for token management
 * 
 * @class AuthService
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    // JwtService is injected for potential future use
    // Currently using UsersService.generateToken() for consistency with existing code
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new user
   * 
   * @param {RegisterDTO} registerDto - Registration data
   * @returns {Promise<{user: User, token: string}>} User data and JWT token
   * @throws {ConflictException} If email/username already exists
   */
  async register(registerDto: RegisterDTO) {
    // Create user (UsersService handles duplicate checks)
    const user = await this.usersService.create(registerDto);

    // Generate JWT token
    const token = this.usersService.generateToken(user);

    return {
      user,
      token,
    };
  }

  /**
   * Authenticates a user and returns JWT token
   * 
   * @param {LoginDTO} loginDto - Login credentials
   * @returns {Promise<{user: User, token: string}>} User data and JWT token
   * @throws {UnauthorizedException} If credentials are invalid
   */
  async login(loginDto: LoginDTO) {
    // Find user by email with password hash
    const userWithPassword = await this.usersService.findByEmailWithPassword(loginDto.email);
    if (!userWithPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    // Handle both hashed and plaintext passwords (for migration)
    const isHashed = userWithPassword.passwordHash?.startsWith('$2a$') || userWithPassword.passwordHash?.startsWith('$2b$');
    
    let isValidPassword = false;
    if (isHashed) {
      isValidPassword = await this.usersService.verifyPassword(loginDto.password, userWithPassword.passwordHash);
    } else {
      // Plaintext password (legacy support)
      isValidPassword = userWithPassword.passwordHash === loginDto.password;
      if (isValidPassword) {
        // Re-hash password for security
        const newHash = await bcrypt.hash(loginDto.password, 12);
        await this.usersService['userRepository'].update(
          { id: userWithPassword.id },
          { passwordHash: newHash },
        );
      }
    }

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get user without password hash for response
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.usersService.generateToken(user);

    // Return user without password hash
    return {
      user,
      token,
    };
  }

  /**
   * Verifies JWT token and returns user data
   * 
   * @param {string} token - JWT token
   * @returns {Promise<User>} User object
   * @throws {UnauthorizedException} If token is invalid
   */
  async verifyToken(token: string) {
    try {
      const decoded = this.usersService.verifyToken(token);
      const user = await this.usersService.findById(decoded.id);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Updates user profile
   * 
   * @param {number} userId - User ID
   * @param {UpdateProfileDTO} updateDto - Profile update data
   * @returns {Promise<User>} Updated user
   */
  async updateProfile(userId: number, updateDto: UpdateProfileDTO) {
    return this.usersService.updateProfile(userId, updateDto);
  }

  /**
   * Gets user statistics
   * 
   * @param {number} userId - User ID
   * @returns {Promise<any>} User statistics
   */
  async getUserStats(userId: number) {
    return this.usersService.getUserStats(userId);
  }
}

