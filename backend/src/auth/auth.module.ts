import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * AuthModule - Authentication and authorization module
 * 
 * Provides:
 * - REST API endpoints
 * - GraphQL mutations/queries
 * - JWT authentication strategy
 * - Guards for route protection
 * 
 * @class AuthModule
 */
@Module({
  imports: [
    // Import UsersModule to use UsersService
    UsersModule,
    
    // Passport module for JWT strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // JWT module configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: '7d', // Token expires in 7 days
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard], // Export for use in other modules
})
export class AuthModule {}

