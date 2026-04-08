import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

/**
 * AuthController - REST API endpoints for authentication
 * 
 * Handles user registration, login, token verification, and profile management
 * Uses JWT authentication for protected routes
 * 
 * @class AuthController
 */
@ApiTags('auth') // Swagger tag
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/register
   * Registers a new user account
   * 
   * @param {RegisterDTO} registerDto - Registration data
   * @returns {Promise<{success: boolean, message: string, data: {user, token}}>}
   */
  @Public() // Public route (no authentication required)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async register(@Body() registerDto: RegisterDTO) {
    const result = await this.authService.register(registerDto);
    return {
      success: true,
      message: 'User registered successfully',
      data: result,
    };
  }

  /**
   * POST /api/auth/login
   * Authenticates a user and returns JWT token
   * 
   * @param {LoginDTO} loginDto - Login credentials
   * @returns {Promise<{success: boolean, message: string, data: {user, token}}>}
   */
  @Public() // Public route
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDTO) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      message: 'Login successful',
      data: result,
    };
  }

  /**
   * POST /api/auth/logout
   * Logs out user (client-side token removal)
   * 
   * @returns {Promise<{success: boolean, message: string}>}
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard) // Protected route
  @ApiBearerAuth('JWT-auth') // Swagger auth
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout() {
    // JWT is stateless, logout is handled client-side by removing token
    return {
      success: true,
      message: 'Logout successful',
    };
  }

  /**
   * GET /api/auth/verify
   * Verifies JWT token validity
   * 
   * @returns {Promise<{success: boolean, message: string, data: {user}}>}
   */
  @Get('verify')
  @UseGuards(JwtAuthGuard) // Protected route
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async verifyToken(@CurrentUser() user: any) {
    return {
      success: true,
      message: 'Token is valid',
      data: { user },
    };
  }

  /**
   * POST /api/auth/forgot-password
   * Initiates password reset process
   * 
   * @param {Object} body - Request body with email
   * @returns {Promise<{success: boolean, message: string}>}
   */
  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset instructions sent' })
  async forgotPassword(@Body() body: { email: string }) {
    // TODO: Implement password reset logic
    return {
      success: true,
      message: 'Password reset instructions sent to your email',
    };
  }

  /**
   * POST /api/auth/reset-password
   * Resets user password
   * 
   * @param {Object} body - Request body with token and new password
   * @returns {Promise<{success: boolean, message: string}>}
   */
  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    // TODO: Implement password reset logic
    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  /**
   * GET /api/auth/users/stats
   * Gets user statistics and achievements
   * 
   * @param {any} user - Current authenticated user (from JWT)
   * @returns {Promise<{success: boolean, data: stats}>}
   */
  @Get('users/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved' })
  async getUserStats(@CurrentUser() user: any) {
    const stats = await this.authService.getUserStats(user.id);

    // Calculate achievements
    const achievements = [
      {
        id: 'first-week',
        title: 'First Week',
        description: 'Complete 7 consecutive days of studying.',
        currentValue: stats.studyStreak || 0,
        targetValue: 7,
        progress: Math.min(100, Math.round(((stats.studyStreak || 0) / 7) * 100)),
        earned: (stats.studyStreak || 0) >= 7,
      },
      {
        id: 'quiz-master',
        title: 'Quiz Master',
        description: 'Score 90% or higher on 5 quizzes.',
        currentValue: stats.totalQuizAttempts || 0,
        targetValue: 5,
        progress: Math.min(100, Math.round(((stats.totalQuizAttempts || 0) / 5) * 100)),
        earned: (stats.totalQuizAttempts || 0) >= 5,
      },
      {
        id: 'flashcard-pro',
        title: 'Flashcard Pro',
        description: 'Review 100 flashcards within a month.',
        currentValue: stats.totalFlashcards || 0,
        targetValue: 100,
        progress: Math.min(100, Math.round(((stats.totalFlashcards || 0) / 100) * 100)),
        earned: (stats.totalFlashcards || 0) >= 100,
      },
    ].filter((a) => a.progress > 0);

    return {
      success: true,
      data: {
        studyStreak: stats.studyStreak || 0,
        totalPoints: stats.totalPoints || 0,
        level: stats.level || 1,
        totalMaterials: stats.totalMaterials || 0,
        totalFlashcards: stats.totalFlashcards || 0,
        totalQuizzes: stats.totalQuizzes || 0,
        totalQuizAttempts: stats.totalQuizAttempts || 0,
        achievements,
      },
    };
  }

  /**
   * PUT /api/auth/users/profile
   * Updates user profile
   * 
   * @param {any} user - Current authenticated user
   * @param {UpdateProfileDTO} updateDto - Profile update data
   * @returns {Promise<{success: boolean, message: string, data: {user}}>}
   */
  @Put('users/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@CurrentUser() user: any, @Body() updateDto: UpdateProfileDTO) {
    const updatedUser = await this.authService.updateProfile(user.id, updateDto);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    };
  }
}

