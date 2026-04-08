import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContentModule } from './content/content.module';
import { FlashcardsModule } from './flashcards/flashcards.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { CollaborationModule } from './collaboration/collaboration.module';
// TODO: Uncomment when modules are created
// import { ProgressModule } from './progress/progress.module';

/**
 * AppModule - Root module of the application
 * 
 * This module imports all feature modules and configures:
 * - ConfigModule: Environment variables
 * - TypeOrmModule: PostgreSQL database connection
 * - GraphQLModule: GraphQL API setup
 * 
 * @class AppModule
 */
@Module({
  imports: [
    // Configuration module - makes environment variables available globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM Database Configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const password = configService.get<string>('DB_PASSWORD') || '';
        // Ensure password is always a string (not undefined/null)
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USER', 'postgres'),
          password: password, // Explicitly ensure it's a string
          database: configService.get<string>('DB_NAME', 'smartlearn'),
          entities: [join(__dirname, '**', '*.entity.{ts,js}')],
          synchronize: configService.get<string>('NODE_ENV') !== 'production', // Auto-sync schema in development
          logging: configService.get<string>('NODE_ENV') === 'development', // Log SQL queries in development
        };
      },
      inject: [ConfigService],
    }),

    // GraphQL Configuration
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req, res }) => ({ req, res }),
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    ContentModule,
    FlashcardsModule,
    QuizzesModule,
    CollaborationModule,
    // TODO: Uncomment when modules are created
    // ProgressModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

