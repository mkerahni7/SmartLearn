# SmartLearn Backend

This is the backend API for SmartLearn, built with NestJS. It handles authentication, file uploads, flashcard/quiz generation, and all the database stuff.

## Getting Started

### Prerequisites
- Node.js (I'm using v18+)
- PostgreSQL (make sure it's running!)
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up environment variables

Create a `.env` file in the `backend` folder:

```env
# Database stuff
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=smartlearn

# JWT secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server
PORT=3001
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

3. Create the database

Make sure PostgreSQL is running, then create the database:

```bash
# Using createdb command
createdb smartlearn

# Or using psql
psql -U postgres
CREATE DATABASE smartlearn;
```

The tables will be created automatically when you start the app (TypeORM does this in dev mode).

### Running the Server

```bash
# Development mode (auto-reloads on changes)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3001`

## What's Available

- **REST API**: Most endpoints are REST (75%)
- **GraphQL API**: Some endpoints use GraphQL (25%)
- **Swagger Docs**: Check out `http://localhost:3001/api/docs` - super helpful for testing
- **GraphQL Playground**: `http://localhost:3001/graphql` - great for testing GraphQL queries

## Project Structure

```
backend/
├── src/
│   ├── main.ts              # Entry point
│   ├── app.module.ts        # Main module
│   │
│   ├── auth/                # Authentication stuff
│   │   ├── auth.controller.ts    # REST endpoints
│   │   ├── auth.resolver.ts      # GraphQL endpoints
│   │   ├── auth.service.ts       # Business logic
│   │   ├── guards/              # JWT guards
│   │   └── strategies/          # Passport strategies
│   │
│   ├── users/               # User management
│   ├── content/             # Study materials
│   ├── flashcards/          # Flashcards module
│   ├── quizzes/            # Quizzes module
│   └── progress/            # Progress tracking
│
├── uploads/                # Uploaded files go here
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token
- `GET /api/auth/users/stats` - Get user stats

### Study Materials
- `GET /api/content` - Get all materials
- `POST /api/content/upload` - Upload a file
- `GET /api/content/:id` - Get specific material
- `POST /api/content/:id/generate/flashcards` - Generate flashcards
- `POST /api/content/:id/generate/quiz` - Generate quiz

### Flashcards
- `GET /api/flashcards` - Get all flashcards
- `POST /api/flashcards` - Create flashcard
- `PUT /api/flashcards/:id` - Update flashcard
- `DELETE /api/flashcards/:id` - Delete flashcard

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get quiz with questions
- `POST /api/quizzes` - Create quiz
- `POST /api/quizzes/:id/submit` - Submit quiz answers

Most endpoints need authentication - include the JWT token in the header:
```
Authorization: Bearer <your-token>
```

## Tech Stack

- **NestJS** - Backend framework
- **TypeORM** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **GraphQL** - Some APIs use this
- **Swagger** - API documentation

## Common Issues

### "Cannot connect to database"
- Make sure PostgreSQL is running
- Check your `.env` file has the right credentials
- Verify the database exists

### "Port 3001 already in use"
- Change the PORT in `.env`
- Or kill whatever's using port 3001

### TypeScript errors about missing modules
- Run `npm install` again
- Sometimes the IDE needs a restart

### Module not found errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Notes

- The database schema auto-syncs in development (TypeORM does this)
- In production, you should use migrations instead
- Change the JWT_SECRET before deploying!
- The `schema.gql` file is auto-generated, don't edit it manually

## Scripts

- `npm run start` - Start the app
- `npm run start:dev` - Development mode with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Run production build

That's pretty much it! If you run into issues, check the Swagger docs or the GraphQL playground - they're really helpful for testing.
