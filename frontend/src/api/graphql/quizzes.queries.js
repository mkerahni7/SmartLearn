import { gql } from '@apollo/client';

/**
 * GraphQL Queries and Mutations for Quizzes
 */

// Query: Get all quizzes
export const GET_QUIZZES = gql`
  query GetQuizzes($page: Int, $limit: Int) {
    quizzes(page: $page, limit: $limit) {
      id
      title
      description
      timeLimit
      totalQuestions
      isPublic
      createdAt
      questions {
        id
        questionText
        questionType
        options
        correctAnswer
        points
        orderIndex
      }
    }
  }
`;

// Query: Get a specific quiz
export const GET_QUIZ = gql`
  query GetQuiz($id: Int!) {
    quiz(id: $id) {
      id
      title
      description
      timeLimit
      totalQuestions
      isPublic
      createdAt
      questions {
        id
        questionText
        questionType
        options
        correctAnswer
        points
        orderIndex
      }
    }
  }
`;

// Mutation: Create a quiz
export const CREATE_QUIZ = gql`
  mutation CreateQuiz($input: CreateQuizDTO!) {
    createQuiz(input: $input) {
      id
      title
      description
      timeLimit
      totalQuestions
      isPublic
      createdAt
    }
  }
`;

// Mutation: Update a quiz
export const UPDATE_QUIZ = gql`
  mutation UpdateQuiz($id: Int!, $input: CreateQuizDTO!) {
    updateQuiz(id: $id, input: $input) {
      id
      title
      description
      timeLimit
      isPublic
      updatedAt
    }
  }
`;

// Mutation: Delete a quiz
export const DELETE_QUIZ = gql`
  mutation DeleteQuiz($id: Int!) {
    deleteQuiz(id: $id)
  }
`;

// Mutation: Add a question to a quiz
export const ADD_QUESTION = gql`
  mutation AddQuestion($quizId: Int!, $input: AddQuestionDTO!) {
    addQuestion(quizId: $quizId, input: $input) {
      id
      title
      totalQuestions
      questions {
        id
        questionText
        options
        correctAnswer
        points
        orderIndex
      }
    }
  }
`;

