import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

/**
 * UsersModule - Module for user management
 * 
 * Provides UsersService for user operations
 * Exports service for use in other modules (e.g., AuthModule)
 * 
 * @class UsersModule
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService], // Export for use in AuthModule
})
export class UsersModule {}

