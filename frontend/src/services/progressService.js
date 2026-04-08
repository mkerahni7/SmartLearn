import api from './authService';

/**
 * Progress Service - Handles all progress tracking API calls
 * This service manages user progress, achievements, and gamification
 */
export const progressService = {
  // Get user's overall progress
  getProgress: async () => {
    const response = await api.get('/api/progress');
    return response;
  },

  // Get user statistics
  getStats: async () => {
    const response = await api.get('/api/progress/stats');
    return response;
  },

  // Get study streak information
  getStudyStreak: async () => {
    const response = await api.get('/api/progress/streak');
    return response;
  },

  // Update study streak
  updateStreak: async (streakData) => {
    const response = await api.post('/api/progress/streak', streakData);
    return response;
  },

  // Add points to user
  addPoints: async (points, reason) => {
    const response = await api.post('/api/progress/points', { points, reason });
    return response;
  },

  // Get user's achievements/badges
  getAchievements: async () => {
    const response = await api.get('/api/progress/achievements');
    return response;
  },

  // Get leaderboard
  getLeaderboard: async (limit = 10) => {
    const response = await api.get(`/api/progress/leaderboard?limit=${limit}`);
    return response;
  },

  // Get progress by time period
  getProgressByPeriod: async (period) => {
    const response = await api.get(`/api/progress/period/${period}`);
    return response;
  },

  // Get study activity log
  getActivityLog: async (limit = 50) => {
    const response = await api.get(`/api/progress/activity?limit=${limit}`);
    return response;
  },

  // Record study session
  recordStudySession: async (sessionData) => {
    const response = await api.post('/api/progress/session', sessionData);
    return response;
  },

  // Get level information
  getLevelInfo: async () => {
    const response = await api.get('/api/progress/level');
    return response;
  }
};
