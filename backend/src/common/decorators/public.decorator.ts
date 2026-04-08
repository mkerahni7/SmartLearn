import { SetMetadata } from '@nestjs/common';

/**
 * Public Decorator - Marks route as publicly accessible (no authentication required)
 * 
 * Usage:
 * @Public()
 * @Get('public-route')
 * getPublicData() {
 *   return { message: 'This is public' };
 * }
 * 
 * @returns {Function} Metadata setter
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

