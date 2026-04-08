import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socketService';

/**
 * useCollaboration - React hook for real-time collaboration features
 * 
 * Provides:
 * - Study room management
 * - Live quiz sessions
 * - Flashcard sharing
 * - Real-time updates
 */
export const useCollaboration = () => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [sharedFlashcards, setSharedFlashcards] = useState([]);
  const [liveQuiz, setLiveQuiz] = useState(null);

  // Connect to WebSocket on mount
  useEffect(() => {
    if (token && user) {
      console.log('🔌 Attempting to connect to collaboration server...');
      console.log('🔌 Token available:', !!token);
      console.log('🔌 User:', user?.username);
      socketService
        .connect(token)
        .then(() => {
          console.log('✅ Successfully connected to collaboration server');
          setIsConnected(true);
          loadRooms();
        })
        .catch((error) => {
          console.error('❌ Failed to connect:', error);
          console.error('❌ Error details:', error.message);
          console.error('❌ Full error:', error);
          setIsConnected(false);
          // Show user-friendly error message
          if (error.message && error.message.includes('timeout')) {
            console.error('⚠️ Connection timeout - Is the backend server running on port 3001?');
          }
        });
    } else {
      console.warn('⚠️ Cannot connect: Missing token or user', { hasToken: !!token, hasUser: !!user });
      setIsConnected(false);
    }

    // Set up event listeners
    const unsubscribeConnected = socketService.on('connected', (data) => {
      setIsConnected(true);
      console.log('Connected:', data);
    });

    const unsubscribeParticipantJoined = socketService.on('participant-joined', (data) => {
      console.log('Participant joined:', data);
      if (data.roomId === currentRoom?.id) {
        loadRooms();
      }
    });

    const unsubscribeParticipantLeft = socketService.on('participant-left', (data) => {
      console.log('Participant left:', data);
      if (data.roomId === currentRoom?.id) {
        loadRooms();
      }
    });

    const unsubscribeFlashcardShared = socketService.on('flashcard-shared', (data) => {
      console.log('Flashcard shared:', data);
      setSharedFlashcards((prev) => [data, ...prev]);
    });

    const unsubscribeLiveQuizStarted = socketService.on('live-quiz-started', (data) => {
      console.log('Live quiz started:', data);
      setLiveQuiz(data);
    });

    const unsubscribeLiveQuizResults = socketService.on('live-quiz-results', (data) => {
      console.log('Live quiz results:', data);
      setLiveQuiz(null);
    });

    const unsubscribeRoomClosed = socketService.on('room-closed', (data) => {
      console.log('Room closed:', data);
      if (data.roomId === currentRoom?.id) {
        setCurrentRoom(null);
        setParticipants([]);
      }
      loadRooms();
    });

    // Cleanup on unmount
    return () => {
      unsubscribeConnected();
      unsubscribeParticipantJoined();
      unsubscribeParticipantLeft();
      unsubscribeFlashcardShared();
      unsubscribeLiveQuizStarted();
      unsubscribeLiveQuizResults();
      unsubscribeRoomClosed();
      if (isConnected) {
        socketService.disconnect();
      }
    };
  }, [token, user, currentRoom]);

  // Load list of active rooms
  const loadRooms = useCallback(async () => {
    try {
      const roomsList = await socketService.getRooms();
      setRooms(roomsList);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  }, []);

  // Create a new study room
  const createRoom = useCallback(async (roomName) => {
    try {
      const room = await socketService.createRoom(roomName);
      setCurrentRoom(room);
      setParticipants([{ id: user.id, username: user.username }]);
      await loadRooms();
      return room;
    } catch (error) {
      console.error('Failed to create room:', error);
      throw error;
    }
  }, [user, loadRooms]);

  // Join a study room
  const joinRoom = useCallback(async (roomId) => {
    try {
      const room = await socketService.joinRoom(roomId);
      setCurrentRoom(room);
      setParticipants(room.participants || []);
      await loadRooms();
      return room;
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  }, [loadRooms]);

  // Leave current room
  const leaveRoom = useCallback(async () => {
    if (!currentRoom) return;

    try {
      await socketService.leaveRoom(currentRoom.id);
      setCurrentRoom(null);
      setParticipants([]);
      await loadRooms();
    } catch (error) {
      console.error('Failed to leave room:', error);
      throw error;
    }
  }, [currentRoom, loadRooms]);

  // Share a flashcard
  const shareFlashcard = useCallback(async (flashcard) => {
    if (!currentRoom) {
      throw new Error('Not in a room');
    }

    try {
      await socketService.shareFlashcard(currentRoom.id, flashcard);
    } catch (error) {
      console.error('Failed to share flashcard:', error);
      throw error;
    }
  }, [currentRoom]);

  // Start live quiz
  const startLiveQuiz = useCallback(async (quizId) => {
    if (!currentRoom) {
      throw new Error('Not in a room');
    }

    try {
      const session = await socketService.startLiveQuiz(currentRoom.id, quizId);
      return session;
    } catch (error) {
      console.error('Failed to start live quiz:', error);
      throw error;
    }
  }, [currentRoom]);

  // Submit quiz answer
  const submitQuizAnswer = useCallback(async (questionIndex, answer) => {
    if (!currentRoom || !liveQuiz) {
      throw new Error('Not in a live quiz');
    }

    try {
      await socketService.submitQuizAnswer(currentRoom.id, questionIndex, answer);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      throw error;
    }
  }, [currentRoom, liveQuiz]);

  // End live quiz
  const endLiveQuiz = useCallback(async (results) => {
    if (!currentRoom) {
      throw new Error('Not in a room');
    }

    try {
      await socketService.endLiveQuiz(currentRoom.id, results);
      setLiveQuiz(null);
    } catch (error) {
      console.error('Failed to end live quiz:', error);
      throw error;
    }
  }, [currentRoom]);

  return {
    isConnected,
    currentRoom,
    rooms,
    participants,
    sharedFlashcards,
    liveQuiz,
    createRoom,
    joinRoom,
    leaveRoom,
    shareFlashcard,
    startLiveQuiz,
    submitQuizAnswer,
    endLiveQuiz,
    loadRooms,
  };
};

