import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Quiz } from './quiz.entity';

/**
 * QuizQuestion Entity - Represents a question within a quiz
 * 
 * Maps to the 'quiz_questions' table in PostgreSQL
 * Contains question text, type, correct answer, and options
 * 
 * @class QuizQuestion
 */
@Entity('quiz_questions')
@ObjectType() // GraphQL decorator
export class QuizQuestion {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'quiz_id' })
  @Field(() => Int)
  quizId: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  @Field(() => Quiz)
  quiz: Quiz;

  @Column({ name: 'question_text', type: 'text' })
  @Field()
  questionText: string;

  @Column({ name: 'question_type', length: 50, default: 'multiple_choice' })
  @Field()
  questionType: string; // 'multiple_choice', 'true_false', 'short_answer'

  @Column({ name: 'correct_answer', type: 'text' })
  @Field()
  correctAnswer: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  options?: string; // JSON string of options array

  @Column({ default: 1 })
  @Field(() => Int)
  points: number;

  @Column({ name: 'order_index', default: 0 })
  @Field(() => Int)
  orderIndex: number;

  @CreateDateColumn({ name: 'created_at' })
  @Field()
  createdAt: Date;
}

