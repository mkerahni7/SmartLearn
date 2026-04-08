import { configureStore } from '@reduxjs/toolkit';
import flashcardsReducer from './flashcards/flashcardsSlice';
import quizzesReducer from './quizzes/quizzesSlice';

/**
 * Redux Store Configuration
 * 
 * Centralized state management using Redux Toolkit
 */
export const store = configureStore({
  reducer: {
    flashcards: flashcardsReducer,
    quizzes: quizzesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['flashcards/fetchFlashcards/fulfilled', 'quizzes/fetchQuizzes/fulfilled'],
      },
    }),
});

