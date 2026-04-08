import api from './authService';

/**
 * Flashcard Service - Handles all flashcard API calls
 * This service manages creating, studying, and organizing flashcards
 */
export const flashcardService = {
  // Get all flashcards for the current user
  getFlashcards: async () => {
    const response = await api.get('/api/flashcards');
    return response;
  },

  // Get flashcards by set ID
  getFlashcardsBySet: async (setId) => {
    const response = await api.get(`/api/flashcards/set/${setId}`);
    return response;
  },

  // Get a specific flashcard by ID
  getFlashcard: async (id) => {
    const response = await api.get(`/api/flashcards/${id}`);
    return response;
  },

  // Create a new flashcard
  createFlashcard: async (flashcardData) => {
    const response = await api.post('/api/flashcards', flashcardData);
    return response;
  },

  // Create multiple flashcards at once
  createFlashcards: async (flashcardsData) => {
    const response = await api.post('/api/flashcards/batch', { flashcards: flashcardsData });
    return response;
  },

  // Update an existing flashcard
  updateFlashcard: async (id, flashcardData) => {
    const response = await api.put(`/api/flashcards/${id}`, flashcardData);
    return response;
  },

  // Delete a flashcard
  deleteFlashcard: async (id) => {
    const response = await api.delete(`/api/flashcards/${id}`);
    return response;
  },

  // Study a flashcard (mark as reviewed)
  studyFlashcard: async (id, difficulty) => {
    const response = await api.post(`/api/flashcards/${id}/study`, { difficulty });
    return response;
  },

  // Get flashcards for review (spaced repetition)
  getFlashcardsForReview: async () => {
    const response = await api.get('/api/flashcards/review');
    return response;
  },

  // Get flashcard statistics
  getFlashcardStats: async () => {
    const response = await api.get('/api/flashcards/stats');
    return response;
  },

  // Create a flashcard set
  createSet: async (setData) => {
    const response = await api.post('/api/flashcards/sets', setData);
    return response;
  },

  // Get all flashcard sets
  getSets: async () => {
    const response = await api.get('/api/flashcards/sets');
    return response;
  }
};
