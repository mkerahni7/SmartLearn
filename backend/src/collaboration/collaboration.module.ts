import { Module } from '@nestjs/common';
import { CollaborationGateway } from './collaboration.gateway';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

/**
 * CollaborationModule - Module for real-time collaborative features
 * 
 * Provides WebSocket-based real-time communication for:
 * - Study rooms
 * - Live quiz sessions
 * - Flashcard sharing
 * 
 * @class CollaborationModule
 */
@Module({
  imports: [UsersModule, JwtModule, ConfigModule],
  providers: [CollaborationGateway],
  exports: [CollaborationGateway],
})
export class CollaborationModule {}

