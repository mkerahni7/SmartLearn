import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/graphql/client';
import {
  GET_QUIZZES,
  GET_QUIZ,
  CREATE_QUIZ,
  UPDATE_QUIZ,
  DELETE_QUIZ,
  ADD_QUESTION,
} from '../../api/graphql/quizzes.queries';

/**
 * Quizzes Redux Slice
 * 
 * Manages quizzes state using Redux Toolkit
 */

// Async thunks for GraphQL operations
export const fetchQuizzes = createAsyncThunk(
  'quizzes/fetchQuizzes',
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await client.query({
        query: GET_QUIZZES,
        variables: { page, limit },
        fetchPolicy: 'network-only',
      });
      return data.quizzes;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchQuiz = createAsyncThunk(
  'quizzes/fetchQuiz',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await client.query({
        query: GET_QUIZ,
        variables: { id: parseInt(id) },
      });
      return data.quiz;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createQuiz = createAsyncThunk(
  'quizzes/createQuiz',
  async (quizData, { rejectWithValue }) => {
    try {
      const { data } = await client.mutate({
        mutation: CREATE_QUIZ,
        variables: { input: quizData },
      });
      return data.createQuiz;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateQuiz = createAsyncThunk(
  'quizzes/updateQuiz',
  async ({ id, ...updateData }, { rejectWithValue }) => {
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_QUIZ,
        variables: { id: parseInt(id), input: updateData },
      });
      return data.updateQuiz;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  'quizzes/deleteQuiz',
  async (id, { rejectWithValue }) => {
    try {
      await client.mutate({
        mutation: DELETE_QUIZ,
        variables: { id: parseInt(id) },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addQuestion = createAsyncThunk(
  'quizzes/addQuestion',
  async ({ quizId, questionData }, { rejectWithValue }) => {
    try {
      const { data } = await client.mutate({
        mutation: ADD_QUESTION,
        variables: { quizId: parseInt(quizId), input: questionData },
      });
      return data.addQuestion;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  quizzes: [],
  currentQuiz: null,
  loading: false,
  error: null,
};

// Redux slice
const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch quizzes
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch single quiz
    builder
      .addCase(fetchQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload;
      })
      .addCase(fetchQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create quiz
    builder
      .addCase(createQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes.unshift(action.payload);
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update quiz
    builder
      .addCase(updateQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.quizzes.findIndex((q) => q.id === action.payload.id);
        if (index !== -1) {
          state.quizzes[index] = action.payload;
        }
        if (state.currentQuiz?.id === action.payload.id) {
          state.currentQuiz = action.payload;
        }
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete quiz
    builder
      .addCase(deleteQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = state.quizzes.filter((q) => q.id !== action.payload);
        if (state.currentQuiz?.id === action.payload) {
          state.currentQuiz = null;
        }
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add question
    builder
      .addCase(addQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.quizzes.findIndex((q) => q.id === action.payload.id);
        if (index !== -1) {
          state.quizzes[index] = action.payload;
        }
        if (state.currentQuiz?.id === action.payload.id) {
          state.currentQuiz = action.payload;
        }
      })
      .addCase(addQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentQuiz } = quizzesSlice.actions;
export default quizzesSlice.reducer;

