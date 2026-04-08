import api from './authService';

/**
 * Quiz Service - Handles all quiz API calls
 * This service manages creating, taking, and grading quizzes
 */
export const quizService = {
  // Get all quizzes for the current user
  getQuizzes: async () => {
    const response = await api.get('/api/quizzes');
    return response;
  },

  // Get a specific quiz by ID
  // shuffle: if true, questions and options will be randomized
  getQuiz: async (id, shuffle = false) => {
    const url = shuffle ? `/api/quizzes/${id}?shuffle=true` : `/api/quizzes/${id}`;
    const response = await api.get(url);
    return response;
  },

  // Create a new quiz
  createQuiz: async (quizData) => {
    const response = await api.post('/api/quizzes', quizData);
    return response;
  },

  // Update an existing quiz
  updateQuiz: async (id, quizData) => {
    const response = await api.put(`/api/quizzes/${id}`, quizData);
    return response;
  },

  // Delete a quiz
  deleteQuiz: async (id) => {
    const response = await api.delete(`/api/quizzes/${id}`);
    return response;
  },

  // Start a quiz attempt
  startQuiz: async (quizId) => {
    const response = await api.post(`/api/quizzes/${quizId}/start`);
    return response;
  },

  // Submit quiz answers
  submitQuiz: async (quizId, answers) => {
    const response = await api.post(`/api/quizzes/${quizId}/submit`, { answers });
    return response;
  },

  // Get quiz results
  getQuizResults: async (quizId) => {
    const response = await api.get(`/api/quizzes/${quizId}/results`);
    return response;
  },

  // Get user's quiz attempts
  getQuizAttempts: async (quizId) => {
    const response = await api.get(`/api/quizzes/${quizId}/attempts`);
    return response;
  },

  // Get all quiz attempts for the user
  getAllAttempts: async () => {
    const response = await api.get('/api/quizzes/attempts');
    return response;
  },

  // Get quiz statistics
  getQuizStats: async () => {
    const response = await api.get('/api/quizzes/stats');
    return response;
  },

  // Get public quizzes (for sharing)
  getPublicQuizzes: async () => {
    const response = await api.get('/api/quizzes/public');
    return response;
  },

  // Share a quiz
  shareQuiz: async (quizId, isPublic) => {
    const response = await api.post(`/api/quizzes/${quizId}/share`, { isPublic });
    return response;
  },

  // Get quiz questions
  getQuizQuestions: async (quizId) => {
    const response = await api.get(`/api/quizzes/${quizId}/questions`);
    return response;
  },

  // Submit quiz attempt with score
  submitQuizAttempt: async (quizId, attemptData) => {
    const response = await api.post(`/api/quizzes/${quizId}/attempts`, attemptData);
    return response;
  }
};
