import api from './authService';

/**
 * Content Service - Handles all study materials API calls
 * This service manages uploading, organizing, and accessing study materials
 */
export const contentService = {
  // Get all study materials for the current user
  getMaterials: async () => {
    const response = await api.get('/api/content');
    return response;
  },

  // Get a specific study material by ID
  getMaterial: async (id) => {
    const response = await api.get(`/api/content/${id}`);
    return response;
  },

  // Create a new study material
  createMaterial: async (materialData) => {
    const response = await api.post('/api/content', materialData);
    return response;
  },

  // Update an existing study material
  updateMaterial: async (id, materialData) => {
    const response = await api.put(`/api/content/${id}`, materialData);
    return response;
  },

  // Delete a study material
  deleteMaterial: async (id) => {
    const response = await api.delete(`/api/content/${id}`);
    return response;
  },

  // Upload a file for study material
  uploadFile: async (formData, materialId) => {
    // Support both FormData and individual parameters
    let data = formData;
    
    if (formData instanceof FormData) {
      data = formData;
    } else {
      // If materialId provided, add it to formData
      const newFormData = new FormData();
      newFormData.append('file', formData);
      newFormData.append('materialId', materialId);
      data = newFormData;
    }
    
    const response = await api.post('/api/content/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Search study materials
  searchMaterials: async (query) => {
    const response = await api.get(`/api/content/search?q=${encodeURIComponent(query)}`);
    return response;
  },

  // Get materials by category
  getMaterialsByCategory: async (category) => {
    const response = await api.get(`/api/content/category/${category}`);
    return response;
  },

  // Generate flashcards from material
  generateFlashcards: async (materialId) => {
    const response = await api.post(`/api/content/${materialId}/generate/flashcards`);
    return response;
  },

  // Generate quiz from material
  generateQuiz: async (materialId) => {
    const response = await api.post(`/api/content/${materialId}/generate/quiz`);
    return response;
  }
};
