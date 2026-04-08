import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/graphql/client';
import {
  GET_FLASHCARDS,
  GET_FLASHCARDS_FOR_REVIEW,
  GET_FLASHCARD,
  CREATE_FLASHCARD,
  UPDATE_FLASHCARD,
  DELETE_FLASHCARD,
} from '../../api/graphql/flashcards.queries';

/**
 * Flashcards Redux Slice
 * 
 * Manages flashcards state using Redux Toolkit
 */

// Async thunks for GraphQL operations
export const fetchFlashcards = createAsyncThunk(
  'flashcards/fetchFlashcards',
  async ({ page = 1, limit = 20, setId = null } = {}, { rejectWithValue }) => {
    try {
      const { data } = await client.query({
        query: GET_FLASHCARDS,
        variables: { page, limit, setId },
        fetchPolicy: 'network-only',
      });
      return data.flashcards;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFlashcardsForReview = createAsyncThunk(
  'flashcards/fetchFlashcardsForReview',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await client.query({
        query: GET_FLASHCARDS_FOR_REVIEW,
        fetchPolicy: 'network-only',
      });
      return data.flashcardsForReview;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFlashcard = createAsyncThunk(
  'flashcards/fetchFlashcard',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await client.query({
        query: GET_FLASHCARD,
        variables: { id: parseInt(id) },
      });
      return data.flashcard;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createFlashcard = createAsyncThunk(
  'flashcards/createFlashcard',
  async (flashcardData, { rejectWithValue }) => {
    try {
      const { data } = await client.mutate({
        mutation: CREATE_FLASHCARD,
        variables: { input: flashcardData },
      });
      return data.createFlashcard;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateFlashcard = createAsyncThunk(
  'flashcards/updateFlashcard',
  async ({ id, ...updateData }, { rejectWithValue }) => {
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_FLASHCARD,
        variables: { id: parseInt(id), input: updateData },
      });
      return data.updateFlashcard;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteFlashcard = createAsyncThunk(
  'flashcards/deleteFlashcard',
  async (id, { rejectWithValue }) => {
    try {
      await client.mutate({
        mutation: DELETE_FLASHCARD,
        variables: { id: parseInt(id) },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  flashcards: [],
  flashcardsForReview: [],
  currentFlashcard: null,
  loading: false,
  error: null,
};

// Redux slice
const flashcardsSlice = createSlice({
  name: 'flashcards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentFlashcard: (state) => {
      state.currentFlashcard = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch flashcards
    builder
      .addCase(fetchFlashcards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlashcards.fulfilled, (state, action) => {
        state.loading = false;
        state.flashcards = action.payload;
      })
      .addCase(fetchFlashcards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch flashcards for review
    builder
      .addCase(fetchFlashcardsForReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlashcardsForReview.fulfilled, (state, action) => {
        state.loading = false;
        state.flashcardsForReview = action.payload;
      })
      .addCase(fetchFlashcardsForReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch single flashcard
    builder
      .addCase(fetchFlashcard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlashcard.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFlashcard = action.payload;
      })
      .addCase(fetchFlashcard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create flashcard
    builder
      .addCase(createFlashcard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFlashcard.fulfilled, (state, action) => {
        state.loading = false;
        state.flashcards.unshift(action.payload);
      })
      .addCase(createFlashcard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update flashcard
    builder
      .addCase(updateFlashcard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFlashcard.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.flashcards.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.flashcards[index] = action.payload;
        }
        if (state.currentFlashcard?.id === action.payload.id) {
          state.currentFlashcard = action.payload;
        }
      })
      .addCase(updateFlashcard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete flashcard
    builder
      .addCase(deleteFlashcard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFlashcard.fulfilled, (state, action) => {
        state.loading = false;
        state.flashcards = state.flashcards.filter((f) => f.id !== action.payload);
        if (state.currentFlashcard?.id === action.payload) {
          state.currentFlashcard = null;
        }
      })
      .addCase(deleteFlashcard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentFlashcard } = flashcardsSlice.actions;
export default flashcardsSlice.reducer;

