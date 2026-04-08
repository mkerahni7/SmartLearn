import { io } from 'socket.io-client';

/**
 * SocketService - Manages WebSocket connection for real-time collaboration
 * 
 * Handles:
 * - Connection to collaboration server
 * - Study room management
 * - Live quiz sessions
 * - Real-time flashcard sharing
 */
class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  /**
   * Connect to WebSocket server
   * @param {string} token - JWT authentication token
   * @returns {Promise<void>}
   */
  connect(token) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return Promise.resolve();
    }

    if (!token) {
      return Promise.reject(new Error('No authentication token provided'));
    }

    return new Promise((resolve, reject) => {
      const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const connectionUrl = `${serverUrl}/collaboration`;
      
      console.log('🔌 Attempting to connect to:', connectionUrl);
      
      // Set a timeout for connection
      const timeout = setTimeout(() => {
        if (!this.isConnected) {
          console.error('❌ Connection timeout');
          if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
          }
          reject(new Error('Connection timeout. Please check if the backend server is running.'));
        }
      }, 10000); // 10 second timeout

      this.socket = io(connectionUrl, {
        transports: ['websocket', 'polling'], // Allow both transports
        auth: {
          token: token,
        },
        query: {
          token: token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      let resolved = false;

      this.socket.on('connect', () => {
        console.log('✅ Socket connected, waiting for authentication...');
        clearTimeout(timeout);
        // Don't resolve yet, wait for 'connected' event (authentication)
      });

      this.socket.on('connected', (data) => {
        console.log('✅ Authenticated:', data);
        this.isConnected = true;
        clearTimeout(timeout);
        if (!resolved) {
          resolved = true;
          resolve(data);
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from collaboration server:', reason);
        this.isConnected = false;
        if (!resolved && reason !== 'io client disconnect') {
          clearTimeout(timeout);
          resolved = true;
          reject(new Error(`Disconnected: ${reason}`));
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        this.isConnected = false;
        clearTimeout(timeout);
        if (!resolved) {
          resolved = true;
          reject(new Error(`Connection failed: ${error.message || 'Unknown error'}`));
        }
      });

      this.socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
        clearTimeout(timeout);
        if (!resolved) {
          resolved = true;
          reject(new Error(`Socket error: ${error.message || 'Unknown error'}`));
        }
      });
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  /**
   * Create a new study room
   * @param {string} roomName - Name of the study room
   * @returns {Promise<Object>} Room data
   */
  createRoom(roomName) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('create-room', { roomName }, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.room);
        }
      });
    });
  }

  /**
   * Join a study room
   * @param {string} roomId - Room ID to join
   * @returns {Promise<Object>} Room data
   */
  joinRoom(roomId) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('join-room', { roomId }, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.room);
        }
      });
    });
  }

  /**
   * Leave a study room
   * @param {string} roomId - Room ID to leave
   * @returns {Promise<void>}
   */
  leaveRoom(roomId) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('leave-room', { roomId }, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Share a flashcard in a study room
   * @param {string} roomId - Room ID
   * @param {Object} flashcard - Flashcard data to share
   * @returns {Promise<void>}
   */
  shareFlashcard(roomId, flashcard) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('share-flashcard', { roomId, flashcard }, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Start a live quiz session
   * @param {string} roomId - Room ID
   * @param {number} quizId - Quiz ID
   * @returns {Promise<Object>} Session data
   */
  startLiveQuiz(roomId, quizId) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('start-live-quiz', { roomId, quizId }, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.session);
        }
      });
    });
  }

  /**
   * Submit answer in live quiz
   * @param {string} roomId - Room ID
   * @param {number} questionIndex - Question index
   * @param {number} answer - Answer index
   * @returns {Promise<void>}
   */
  submitQuizAnswer(roomId, questionIndex, answer) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('submit-quiz-answer', { roomId, questionIndex, answer }, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * End live quiz and show results
   * @param {string} roomId - Room ID
   * @param {Object} results - Quiz results
   * @returns {Promise<void>}
   */
  endLiveQuiz(roomId, results) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('end-live-quiz', { roomId, results }, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get list of active study rooms
   * @returns {Promise<Array>} List of rooms
   */
  getRooms() {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('get-rooms', {}, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.rooms);
        }
      });
    });
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return () => {};
    }

    this.socket.on(event, callback);

    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      this.socket.off(event, callback);
      const listeners = this.listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Optional callback to remove specific listener
   */
  off(event, callback) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;

