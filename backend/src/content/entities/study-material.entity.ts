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
import { Flashcard } from '../../flashcards/entities/flashcard.entity';

/**
 * StudyMaterial Entity - Represents a study material (note, PDF, DOCX, etc.)
 * 
 * Maps to the 'study_materials' table in PostgreSQL
 * Can be linked to flashcards and quizzes generated from it
 * 
 * @class StudyMaterial
 */
@Entity('study_materials')
@ObjectType() // GraphQL decorator
export class StudyMaterial {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'user_id' })
  @Field(() => Int)
  userId: number;

  @ManyToOne(() => User, (user) => user.studyMaterials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Field(() => User)
  user: User;

  @Column({ length: 200 })
  @Field()
  title: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({ name: 'content_type', length: 50, default: 'note' })
  @Field()
  contentType: string; // 'note', 'pdf', 'docx', 'pptx', 'txt'

  @Column({ name: 'file_path', type: 'text', nullable: true })
  @Field({ nullable: true })
  filePath?: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  tags?: string;

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
  @OneToMany(() => Flashcard, (flashcard) => flashcard.studyMaterial)
  flashcards: Flashcard[];
}

