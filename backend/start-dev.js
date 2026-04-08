/**
 * Custom startup script for development
 * Sets Node.js options before starting NestJS
 */
process.env.NODE_OPTIONS = '--max-http-header-size=16384';
require('@nestjs/cli/bin/nest.js');

