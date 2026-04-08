import React, { useState, useEffect } from 'react';
import { useCollaboration } from '../hooks/useCollaboration';
import { useAuth } from '../context/AuthContext';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFlashcards } from '../store/flashcards/flashcardsSlice';
import {
  Users,
  Plus,
  LogIn,
  LogOut,
  Share2,
  Zap,
  MessageSquare,
  Copy,
  Check,
  Search,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/pages/study-rooms.css';

/**
 * StudyRoomsPage - Page for collaborative study rooms
 * 
 * Features:
 * - Create and join study rooms
 * - Real-time participant list
 * - Share flashcards
 * - Live quiz sessions
 */
const StudyRoomsPage = () => {
  const { user } = useAuth();
  const {
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
    loadRooms,
  } = useCollaboration();

  const [roomName, setRoomName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomIdToJoin, setRoomIdToJoin] = useState('');
  const [showFlashcardSelector, setShowFlashcardSelector] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState(null);
  
  const dispatch = useDispatch();
  const { flashcards } = useSelector((state) => state.flashcards);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    try {
      await createRoom(roomName);
      setShowCreateModal(false);
      setRoomName('');
      toast.success('Room created successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to create room');
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      await joinRoom(roomId);
      toast.success('Joined room successfully!');
      setShowJoinModal(false);
      setRoomIdToJoin('');
    } catch (error) {
      toast.error(error.message || 'Failed to join room');
    }
  };

  const handleJoinByRoomId = async () => {
    if (!roomIdToJoin.trim()) {
      toast.error('Please enter a Room ID');
      return;
    }
    await handleJoinRoom(roomIdToJoin.trim());
  };

  // Load flashcards when showing selector
  useEffect(() => {
    if (showFlashcardSelector && flashcards.length === 0) {
      dispatch(fetchFlashcards({ page: 1, limit: 100 }));
    }
  }, [showFlashcardSelector, flashcards.length, dispatch]);

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom();
      toast.success('Left room successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to leave room');
    }
  };

  const handleShareFlashcard = async () => {
    if (!selectedFlashcard) {
      toast.error('Please select a flashcard to share');
      return;
    }

    try {
      await shareFlashcard(selectedFlashcard);
      toast.success('Flashcard shared!');
      setSelectedFlashcard(null);
      setShowFlashcardSelector(false);
    } catch (error) {
      toast.error(error.message || 'Failed to share flashcard');
    }
  };

  const copyRoomId = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.id);
      toast.success('Room ID copied to clipboard!');
    }
  };

  if (!isConnected) {
    return (
      <div className="study-rooms-container">
        <div className="connection-status">
          <div className="status-indicator offline"></div>
          <p>Connecting to collaboration server...</p>
          <p className="connection-hint">
            Make sure the backend server is running on port 3001
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="study-rooms-container">
      <div className="study-rooms-header">
        <h1>
          <Users className="icon" />
          Study Rooms
        </h1>
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`}></div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {!currentRoom ? (
        <div className="rooms-section">
          <div className="rooms-header">
            <h2>Available Rooms</h2>
            <div className="rooms-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowJoinModal(true)}
              >
                <LogIn /> Join by ID
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus /> Create Room
              </button>
            </div>
          </div>

          <div className="rooms-list">
            {rooms.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <p>No active rooms. Create one to get started!</p>
              </div>
            ) : (
              rooms.map((room) => (
                <div key={room.id} className="room-card">
                  <div className="room-info">
                    <h3>{room.name}</h3>
                    <p className="room-host">Host: {room.hostUsername}</p>
                    <p className="room-participants">
                      <Users size={16} /> {room.participantCount} participant
                      {room.participantCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    <LogIn /> Join
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="current-room">
          <div className="room-header">
            <div>
              <h2>{currentRoom.name}</h2>
              <div className="room-id-section">
                <span className="room-id-label">Room ID:</span>
                <code className="room-id">{currentRoom.id}</code>
                <button className="copy-btn" onClick={copyRoomId}>
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <button className="btn btn-danger" onClick={handleLeaveRoom}>
              <LogOut /> Leave Room
            </button>
          </div>

          <div className="room-content">
            <div className="room-sidebar">
              <div className="participants-section">
                <h3>
                  <Users /> Participants ({participants.length})
                </h3>
                <div className="participants-list">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className={`participant ${
                        participant.id === user.id ? 'you' : ''
                      }`}
                    >
                      <div className="participant-avatar">
                        {participant.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="participant-name">
                        {participant.username}
                        {participant.id === user.id && ' (You)'}
                        {participant.id === currentRoom.hostId && ' 👑'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {liveQuiz && (
                <div className="live-quiz-section">
                  <h3>
                    <Zap /> Live Quiz Active
                  </h3>
                  <p>Quiz ID: {liveQuiz.quizId}</p>
                  <p>Participants: {liveQuiz.participantCount}</p>
                </div>
              )}
            </div>

            <div className="room-main">
              <div className="shared-flashcards-section">
                <div className="section-header">
                  <h3>
                    <Share2 /> Shared Flashcards
                  </h3>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowFlashcardSelector(true)}
                  >
                    <Share2 size={16} /> Share Flashcard
                  </button>
                </div>
                {sharedFlashcards.length === 0 ? (
                  <div className="empty-state">
                    <MessageSquare size={32} />
                    <p>No flashcards shared yet</p>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowFlashcardSelector(true)}
                    >
                      Share your first flashcard
                    </button>
                  </div>
                ) : (
                  <div className="shared-flashcards-list">
                    {sharedFlashcards.map((item, index) => (
                      <div key={index} className="shared-flashcard-card">
                        <div className="flashcard-header">
                          <span className="shared-by">
                            Shared by {item.from.username}
                          </span>
                          <span className="shared-time">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flashcard-content">
                          <div className="flashcard-front">
                            <strong>Q:</strong> {item.flashcard.frontText}
                          </div>
                          <div className="flashcard-back">
                            <strong>A:</strong> {item.flashcard.backText}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Study Room</h2>
            <input
              type="text"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateRoom}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Join Study Room</h2>
            <p className="modal-description">Enter the Room ID to join</p>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomIdToJoin}
              onChange={(e) => setRoomIdToJoin(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinByRoomId()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowJoinModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleJoinByRoomId}>
                Join
              </button>
            </div>
          </div>
        </div>
      )}

      {showFlashcardSelector && (
        <div className="modal-overlay" onClick={() => setShowFlashcardSelector(false)}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select Flashcard to Share</h2>
              <button className="close-btn" onClick={() => setShowFlashcardSelector(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="flashcard-selector-list">
              {flashcards.length === 0 ? (
                <div className="empty-state">
                  <MessageSquare size={32} />
                  <p>No flashcards available. Create some flashcards first!</p>
                </div>
              ) : (
                flashcards.map((card) => {
                  const question = card.front_text || card.frontText || 'No question provided';
                  const answer = card.back_text || card.backText || 'No answer provided yet';
                  const isSelected = selectedFlashcard?.id === card.id;

                  return (
                    <div
                      key={card.id}
                      className={`flashcard-selector-item ${isSelected ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Flashcard clicked:', card);
                        setSelectedFlashcard(card);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedFlashcard(card);
                        }
                      }}
                    >
                      <div className="flashcard-selector-content">
                        <div className="flashcard-selector-front">
                          <strong>Q:</strong> {question.substring(0, 100)}
                          {question.length > 100 && '...'}
                        </div>
                        <div className="flashcard-selector-back">
                          <strong>A:</strong> {answer.substring(0, 100)}
                          {answer.length > 100 && '...'}
                        </div>
                      </div>
                      {isSelected && <Check size={20} className="check-icon" />}
                    </div>
                  );
                })
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowFlashcardSelector(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleShareFlashcard}
                disabled={!selectedFlashcard}
              >
                <Share2 size={16} /> Share Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyRoomsPage;

