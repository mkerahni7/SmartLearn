import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { StudyMaterial } from '../../content/entities/study-material.entity';

/**
 * Flashcard Entity - Represents a flashcard for studying
 * 
 * Maps to the 'flashcards' table in PostgreSQL
 * Contains front/back text, difficulty level, and review tracking
 * 
 * @class Flashcard
 */
@Entity('flashcards')
@ObjectType() // GraphQL decorator
export class Flashcard {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'user_id' })
  @Field(() => Int)
  userId: number;

  @ManyToOne(() => User, (user) => user.flashcards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Field(() => User)
  user: User;

  @Column({ name: 'study_material_id', nullable: true })
  @Field(() => Int, { nullable: true })
  studyMaterialId?: number;

  @ManyToOne(() => StudyMaterial, (material) => material.flashcards, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'study_material_id' })
  @Field(() => StudyMaterial, { nullable: true })
  studyMaterial?: StudyMaterial;

  @Column({ name: 'front_text', type: 'text' })
  @Field()
  frontText: string;

  @Column({ name: 'back_text', type: 'text' })
  @Field()
  backText: string;

  @Column({ name: 'difficulty_level', default: 1 })
  @Field(() => Int)
  difficultyLevel: number;

  @Column({ name: 'times_reviewed', default: 0 })
  @Field(() => Int)
  timesReviewed: number;

  @Column({ name: 'correct_answers', default: 0 })
  @Field(() => Int)
  correctAnswers: number;

  @Column({ name: 'last_reviewed', type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  lastReviewed?: Date;

  @Column({ name: 'next_review', type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  nextReview?: Date;

  @CreateDateColumn({ name: 'created_at' })
  @Field()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Field()
  updatedAt: Date;
}

