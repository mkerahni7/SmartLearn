import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

/**
 * JwtAuthGuard - Protects routes requiring authentication
 * 
 * Uses JWT strategy to verify tokens
 * Can be applied to controllers or individual routes
 * 
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * @Controller('protected')
 * 
 * @class JwtAuthGuard
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Override getRequest to handle GraphQL context
   * This is called by Passport's AuthGuard internally
   */
  getRequest(context: ExecutionContext) {
    // Try GraphQL context first
    try {
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext();
      let request = ctx?.req;
      
      // If req doesn't exist, create it
      if (!request) {
        request = {
          headers: ctx?.req?.headers || {},
          user: null,
        };
        ctx.req = request;
      }
      
      // Ensure request has Passport methods before Passport tries to use them
      if (typeof request.logIn !== 'function') {
        request.logIn = function(user: any, callback?: (err?: any) => void) {
          this.user = user;
          if (callback) {
            callback();
          }
        };
      }
      if (typeof request.login !== 'function') {
        request.login = request.logIn;
      }
      if (typeof request.logout !== 'function') {
        request.logout = function(callback?: (err?: any) => void) {
          this.user = null;
          if (callback) {
            callback();
          }
        };
      }
      
      return request;
    } catch {
      // Not a GraphQL context, use REST
    }
    
    // Use REST context
    const request = context.switchToHttp().getRequest();
    
    // Ensure REST request also has Passport methods
    if (request && typeof request.logIn !== 'function') {
      request.logIn = function(user: any, callback?: (err?: any) => void) {
        if (callback) {
          callback();
        }
      };
      request.login = request.logIn;
      request.logout = function(callback?: (err?: any) => void) {
        if (callback) {
          callback();
        }
      };
    }
    
    return request;
  }

  /**
   * Determines if route should be accessible without authentication
   * Checks for @Public() decorator
   * 
   * @param {ExecutionContext} context - Execution context
   * @returns {boolean} True if route is public
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}

