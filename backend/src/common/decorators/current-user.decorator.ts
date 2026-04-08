import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * CurrentUser Decorator - Extracts authenticated user from request
 * 
 * Usage in controllers:
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 * 
 * @param {any} data - Decorator data (not used)
 * @param {ExecutionContext} ctx - Execution context
 * @returns {any} Authenticated user object
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Set by JwtAuthGuard after token validation
  },
);

