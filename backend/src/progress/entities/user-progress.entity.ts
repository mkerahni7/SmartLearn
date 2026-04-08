import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

/**
 * UserProgress Entity - Tracks user activity and progress
 * 
 * Maps to the 'user_progress' table in PostgreSQL
 * Records points earned from various activities
 * 
 * @class UserProgress
 */
@Entity('user_progress')
@ObjectType() // GraphQL decorator
export class UserProgress {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'user_id' })
  @Field(() => Int)
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Field(() => User)
  user: User;

  @Column({ name: 'activity_type', length: 50 })
  @Field()
  activityType: string; // 'flashcard_review', 'quiz_completed', 'material_uploaded'

  @Column({ name: 'activity_id' })
  @Field(() => Int)
  activityId: number;

  @Column({ name: 'points_earned', default: 0 })
  @Field(() => Int)
  pointsEarned: number;

  @CreateDateColumn({ name: 'completed_at' })
  @Field()
  completedAt: Date;
}

