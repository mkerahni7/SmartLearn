import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { StudyMaterial } from '../../content/entities/study-material.entity';
import { Flashcard } from '../../flashcards/entities/flashcard.entity';
import { Quiz } from '../../quizzes/entities/quiz.entity';

/**
 * User Entity - Represents a user in the system
 * 
 * Maps to the 'users' table in PostgreSQL
 * Contains user authentication, profile, and gamification data
 * 
 * @class User
 */
@Entity('users')
@ObjectType() // GraphQL decorator
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => Int) // GraphQL field
  id: number;

  @Column({ unique: true, length: 50 })
  @Field() // GraphQL field
  username: string;

  @Column({ unique: true, length: 100 })
  @Field() // GraphQL field
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string; // Not exposed in GraphQL for security

  @Column({ name: 'first_name', length: 50, nullable: true })
  @Field({ nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', length: 50, nullable: true })
  @Field({ nullable: true })
  lastName?: string;

  @Column({ name: 'avatar_url', length: 255, nullable: true })
  @Field({ nullable: true })
  avatarUrl?: string;

  @Column({ name: 'study_streak', default: 0 })
  @Field(() => Int)
  studyStreak: number;

  @Column({ name: 'total_points', default: 0 })
  @Field(() => Int)
  totalPoints: number;

  @Column({ default: 1 })
  @Field(() => Int)
  level: number;

  @CreateDateColumn({ name: 'created_at' })
  @Field()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Field()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => StudyMaterial, (material) => material.user)
  studyMaterials: StudyMaterial[];

  @OneToMany(() => Flashcard, (flashcard) => flashcard.user)
  flashcards: Flashcard[];

  @OneToMany(() => Quiz, (quiz) => quiz.user)
  quizzes: Quiz[];
}

