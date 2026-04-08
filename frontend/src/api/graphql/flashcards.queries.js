import { gql } from '@apollo/client';

/**
 * GraphQL Queries and Mutations for Flashcards
 */

// Query: Get all flashcards
export const GET_FLASHCARDS = gql`
  query GetFlashcards($page: Int, $limit: Int, $setId: Int) {
    flashcards(page: $page, limit: $limit, setId: $setId) {
      id
      frontText
      backText
      difficultyLevel
      timesReviewed
      correctAnswers
      lastReviewed
      nextReview
      studyMaterialId
      createdAt
    }
  }
`;

// Query: Get flashcards for review
export const GET_FLASHCARDS_FOR_REVIEW = gql`
  query GetFlashcardsForReview {
    flashcardsForReview {
      id
      frontText
      backText
      difficultyLevel
      timesReviewed
      correctAnswers
      lastReviewed
      nextReview
      studyMaterialId
    }
  }
`;

// Query: Get a specific flashcard
export const GET_FLASHCARD = gql`
  query GetFlashcard($id: Int!) {
    flashcard(id: $id) {
      id
      frontText
      backText
      difficultyLevel
      timesReviewed
      correctAnswers
      lastReviewed
      nextReview
      studyMaterialId
      createdAt
    }
  }
`;

// Mutation: Create a flashcard
export const CREATE_FLASHCARD = gql`
  mutation CreateFlashcard($input: CreateFlashcardDTO!) {
    createFlashcard(input: $input) {
      id
      frontText
      backText
      difficultyLevel
      studyMaterialId
      createdAt
    }
  }
`;

// Mutation: Update a flashcard
export const UPDATE_FLASHCARD = gql`
  mutation UpdateFlashcard($id: Int!, $input: UpdateFlashcardDTO!) {
    updateFlashcard(id: $id, input: $input) {
      id
      frontText
      backText
      difficultyLevel
      updatedAt
    }
  }
`;

// Mutation: Delete a flashcard
export const DELETE_FLASHCARD = gql`
  mutation DeleteFlashcard($id: Int!) {
    deleteFlashcard(id: $id)
  }
`;

