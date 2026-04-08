import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { QuizQuestion } from './quiz-question.entity';

/**
 * Quiz Entity - Represents a quiz/test
 * 
 * Maps to the 'quizzes' table in PostgreSQL
 * Contains quiz metadata and links to questions
 * 
 * @class Quiz
 */
@Entity('quizzes')
@ObjectType() // GraphQL decorator
export class Quiz {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'user_id' })
  @Field(() => Int)
  userId: number;

  @ManyToOne(() => User, (user) => user.quizzes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Field(() => User)
  user: User;

  @Column({ length: 200 })
  @Field()
  title: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({ name: 'time_limit', type: 'integer', nullable: true })
  @Field(() => Int, { nullable: true })
  timeLimit?: number; // Time limit in seconds

  @Column({ name: 'total_questions', default: 0 })
  @Field(() => Int)
  totalQuestions: number;

  @Column({ name: 'is_public', default: false })
  @Field()
  isPublic: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @Field()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Field()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => QuizQuestion, (question) => question.quiz, { cascade: true })
  @Field(() => [QuizQuestion])
  questions: QuizQuestion[];
}

