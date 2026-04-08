import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

/**
 * JWT Strategy - Validates JWT tokens from requests
 * 
 * Extracts JWT token from Authorization header
 * Validates token and returns user payload
 * Used by JwtAuthGuard to protect routes
 * 
 * @class JwtStrategy
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract token from "Bearer <token>"
      ignoreExpiration: false, // Don't ignore expiration
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key', // Secret key from env
    });
  }

  /**
   * Validates JWT token payload
   * Called automatically by Passport after token is verified
   * 
   * @param {any} payload - Decoded JWT token payload
   * @returns {Promise<any>} User object to attach to request
   * @throws {UnauthorizedException} If user not found
   */
  async validate(payload: any) {
    // Payload contains: { id, email, username, iat, exp }
    const user = await this.usersService.findById(payload.id);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return user object - will be available as req.user in controllers
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}

