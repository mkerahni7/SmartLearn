import { Resolver, Mutation, Query, Args, Context, ObjectType, Field } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * AuthResponse - GraphQL return type for auth operations
 */
@ObjectType()
export class AuthResponse {
  @Field(() => User)
  user: User;

  @Field()
  token: string;
}

/**
 * AuthResolver - GraphQL resolver for authentication
 * 
 * Provides GraphQL mutations for login and register
 * 
 * @class AuthResolver
 */
@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * Mutation: register
   * Registers a new user via GraphQL
   * 
   * @param {RegisterDTO} registerDto - Registration data
   * @returns {Promise<AuthResponse>} User data and JWT token
   */
  @Mutation(() => AuthResponse, { name: 'register' })
  async register(@Args('input') registerDto: RegisterDTO): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  /**
   * Mutation: login
   * Authenticates user via GraphQL
   * 
   * @param {LoginDTO} loginDto - Login credentials
   * @returns {Promise<AuthResponse>} User data and JWT token
   */
  @Mutation(() => AuthResponse, { name: 'login' })
  async login(@Args('input') loginDto: LoginDTO): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  /**
   * Query: me
   * Gets current authenticated user
   * 
   * @param {any} context - GraphQL context (contains request)
   * @returns {Promise<User>} Current user
   */
  @Query(() => User, { name: 'me' })
  @UseGuards(JwtAuthGuard)
  async me(@Context() context: any): Promise<User> {
    const user = context.req.user; // Set by JwtAuthGuard
    // Return user entity
    return this.authService['usersService'].findById(user.id);
  }
}

