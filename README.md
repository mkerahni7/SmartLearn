# SmartLearn

A full-stack learning platform where you can upload study materials, generate flashcards and quizzes automatically, and track your progress. Built for CSIS 279 - Advances in Computer Science at University of Balamand.

## 📚 Documentation

- **[Technical Documentation](./TECHNICAL_DOCUMENTATION.md)** - Complete method documentation with parameters and returns
- **[Database Schema](./DATABASE_SCHEMA.md)** - Complete database schema description
- **[Third-Party Libraries](./THIRD_PARTY_LIBRARIES.md)** - All libraries used and their purposes
- **[Backend README](./backend/README.md)** - Backend-specific setup and API documentation

## What It Does

Upload PDFs, DOCX files, or PowerPoints, and SmartLearn will:
- Extract text from your files
- Generate flashcards automatically
- Create quizzes with multiple choice questions
- Track your study progress with points and streaks
- Make studying way more interactive

## Tech Stack

**Frontend:**
- React 18
- Redux Toolkit (for flashcards & quizzes)
- Apollo Client (for GraphQL)
- React Router
- Axios (for REST API calls)

**Backend:**
- NestJS
- PostgreSQL
- TypeORM
- GraphQL (25% of API)
- REST (75% of API)
- JWT authentication

## Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL
- npm

### Setup

1. **Clone and install backend:**
```bash
cd backend
npm install
```

2. **Create `.env` file in `backend/` folder:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=smartlearn
JWT_SECRET=your-secret-key-here
PORT=3001
FRONTEND_URL=http://localhost:3000
```

3. **Create database:**
```bash
createdb smartlearn
```

4. **Start backend:**
```bash
cd backend
npm run start:dev
```

5. **Install and start frontend:**
```bash
cd frontend
npm install
npm start
```

That's it! Backend runs on `http://localhost:3001`, frontend on `http://localhost:3000`.

## Features

- **User Authentication** - Register, login, JWT tokens
- **File Upload** - Upload PDF, DOCX, PPTX, TXT files
- **Auto-Generated Flashcards** - AI extracts key concepts and creates flashcards
- **Quiz Generation** - Creates quizzes from your materials
- **Progress Tracking** - Points, streaks, levels, achievements
- **GraphQL & REST** - Mix of both APIs
- **Redux State Management** - For flashcards and quizzes
- **Real-Time Collaboration** - WebSocket-based study rooms with live flashcard sharing and quiz sessions

## Project Structure

```
advances/
├── backend/          # NestJS backend
│   ├── src/
│   │   ├── auth/     # Authentication
│   │   ├── content/  # Study materials
│   │   ├── flashcards/
│   │   └── quizzes/
│   └── package.json
│
└── frontend/         # React frontend
    ├── src/
    │   ├── pages/    # Page components
    │   ├── store/    # Redux store
    │   ├── api/      # GraphQL client
    │   └── services/ # REST API calls
    └── package.json
```

## API Documentation

### Interactive Documentation

Once the backend is running:
- **Swagger UI**: http://localhost:3001/api/docs
  - Complete REST API documentation
  - Test endpoints directly from the browser
  - Includes request/response examples
- **GraphQL Playground**: http://localhost:3001/graphql
  - Interactive GraphQL query editor
  - Schema explorer
  - Query testing interface

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/users/stats` - Get user statistics

#### Study Materials
- `GET /api/content` - Get all materials (query: page, limit, search, type)
- `GET /api/content/:id` - Get specific material
- `POST /api/content` - Create material
- `POST /api/content/upload` - Upload file (PDF, DOCX, PPTX, TXT)
- `PUT /api/content/:id` - Update material
- `DELETE /api/content/:id` - Delete material
- `POST /api/content/:id/generate/flashcards` - Generate flashcards from material
- `POST /api/content/:id/generate/quiz` - Generate quiz from material

#### Flashcards
- `GET /api/flashcards` - Get all flashcards (query: page, limit, setId, search)
- `GET /api/flashcards/:id` - Get specific flashcard
- `POST /api/flashcards` - Create flashcard
- `PUT /api/flashcards/:id` - Update flashcard
- `DELETE /api/flashcards/:id` - Delete flashcard
- `POST /api/flashcards/:id/study` - Record flashcard study session

#### Quizzes
- `GET /api/quizzes` - Get all quizzes (query: page, limit, search, isPublic)
- `GET /api/quizzes/:id` - Get quiz with questions (query: shuffle=true)
- `POST /api/quizzes` - Create quiz
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz
- `POST /api/quizzes/:id/submit` - Submit quiz answers

**Note:** Most endpoints require JWT authentication. Include token in header:
```
Authorization: Bearer <your-token>
```

For complete API documentation, see [Technical Documentation](./TECHNICAL_DOCUMENTATION.md).

## How to Use

1. **Register/Login** - Create an account or login
2. **Upload Material** - Go to Materials page, upload a PDF or DOCX
3. **Generate Flashcards** - Click "Generate Flashcards" on a material
4. **Study Flashcards** - Flip through cards, track your progress
5. **Take Quizzes** - Generate a quiz from material, take it, see your score
6. **Track Progress** - Check your dashboard for stats, points, and streaks

## Database

The database uses **PostgreSQL**. Tables are created automatically in development mode.

### Main Tables
- `users` - User accounts, authentication, gamification data
- `study_materials` - Uploaded files (PDF, DOCX, PPTX, TXT, notes)
- `flashcards` - Flashcard sets with spaced repetition tracking
- `quizzes` - Quiz metadata
- `quiz_questions` - Individual quiz questions with options

### Database Schema

For complete database schema documentation including:
- Table structures and relationships
- Foreign key constraints
- Indexes and performance optimization
- Sample queries

See **[Database Schema Documentation](./DATABASE_SCHEMA.md)**

## Troubleshooting

**Backend won't start:**
- Check PostgreSQL is running
- Verify `.env` file exists and has correct values
- Make sure database exists

**Frontend can't connect:**
- Make sure backend is running on port 3001
- Check CORS settings in backend

**GraphQL errors:**
- Make sure you're logged in (need JWT token)
- Check browser console for specific errors

## How to Run and Test

### Running the Application

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run start
   ```
   Backend runs on http://localhost:3001

2. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Frontend runs on http://localhost:3000

### Testing the Application

1. **Test REST API:**
   - Open Swagger UI: http://localhost:3001/api/docs
   - Use the interactive interface to test endpoints
   - Click "Authorize" and enter your JWT token

2. **Test GraphQL:**
   - Open GraphQL Playground: http://localhost:3001/graphql
   - Write queries in the left panel
   - Click the play button to execute

3. **Test Frontend:**
   - Register a new account
   - Upload a PDF or DOCX file
   - Generate flashcards and quizzes
   - Take quizzes and track progress

### Example GraphQL Queries

```graphql
# Get all flashcards
query {
  flashcards(limit: 10) {
    id
    frontText
    backText
    difficultyLevel
  }
}

# Get all quizzes
query {
  quizzes(limit: 10) {
    id
    title
    totalQuestions
    questions {
      questionText
      options
    }
  }
}

# Login
mutation {
  login(input: {
    email: "user@example.com"
    password: "password123"
  }) {
    token
    user {
      id
      username
      email
    }
  }
}
```

## Development Notes

- Backend uses TypeORM which auto-creates tables in dev mode
- GraphQL schema file (`schema.gql`) is auto-generated, don't edit it
- Frontend uses Redux for flashcards/quizzes (25% of state), Context for auth (75%)
- Most API calls are REST (75%), but flashcards and quizzes use GraphQL (25%)
- All passwords are hashed using bcrypt (12 rounds)
- JWT tokens expire after 7 days
- **Real-Time Collaboration:** WebSocket server runs on `/collaboration` namespace using Socket.IO

## High-Level Features

### Real-Time Collaborative Studying (WebSocket)

SmartLearn includes a high-level real-time collaboration feature using WebSockets:

- **Study Rooms:** Create and join study rooms for collaborative learning
- **Live Flashcard Sharing:** Share flashcards in real-time with room participants
- **Live Quiz Sessions:** Host and participate in synchronized quiz sessions
- **Real-Time Updates:** See participants join/leave, shared content, and quiz progress instantly
- **WebSocket Technology:** Built with Socket.IO for reliable real-time communication

**How to Use:**
1. Navigate to "Study Rooms" in the navigation menu
2. Create a new room or join an existing one
3. Share flashcards with room participants
4. Start live quiz sessions for synchronized testing

This feature demonstrates advanced WebSocket implementation, real-time state management, and collaborative learning capabilities.

## Third-Party Libraries

This project uses various third-party libraries for:
- **Backend:** NestJS, TypeORM, GraphQL, JWT, Swagger, Socket.IO, file processing (PDF, DOCX, PPTX)
- **Frontend:** React, Redux Toolkit, Apollo Client, Axios, React Router, Socket.IO Client

For a complete list of all libraries, their versions, and purposes, see **[Third-Party Libraries Documentation](./THIRD_PARTY_LIBRARIES.md)**

## Project Structure

```
advances/
├── backend/              # NestJS backend
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── users/        # User management
│   │   ├── content/      # Study materials
│   │   ├── flashcards/   # Flashcards module
│   │   ├── quizzes/      # Quizzes module
│   │   └── common/       # Shared utilities
│   ├── uploads/          # Uploaded files
│   └── package.json
│
└── frontend/             # React frontend
    ├── src/
    │   ├── pages/        # Page components
    │   ├── components/   # Reusable components
    │   ├── store/        # Redux store (25% of state)
    │   ├── api/          # GraphQL client (25% of API)
    │   ├── services/     # REST API calls (75% of API)
    │   └── context/      # React Context (75% of state)
    └── package.json
```

## Error Handling

The application implements robust error handling:

- **Backend:** Uses NestJS exception filters, validation pipes, and custom error handlers
- **Frontend:** Try-catch blocks, error boundaries, and user-friendly error messages
- **HTTP Status Codes:** 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 409 (Conflict), 500 (Server Error)

## Security Measures

1. **JWT Authentication:** All protected endpoints require valid JWT token
2. **Password Hashing:** bcrypt with 12 salt rounds
3. **Input Validation:** class-validator on all DTOs
4. **CORS:** Configured to allow only frontend origin
5. **SQL Injection Protection:** TypeORM uses parameterized queries

## What I Learned

- NestJS modular architecture and dependency injection
- GraphQL with Apollo Server and Client
- Redux Toolkit for state management
- File parsing and text extraction (PDF, DOCX, PPTX)
- JWT authentication and authorization
- TypeORM with PostgreSQL
- REST and GraphQL API design
- React component architecture

---

**Project:** CSIS 279 - Advances in Computer Science  
**University:** University of Balamand  
**Faculty:** Faculty of Arts & Sciences  
**Author:** [Your Name]  
**Date:** 2025

For detailed technical documentation, see [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)
