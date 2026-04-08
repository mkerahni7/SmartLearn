import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  username?: string;
}

interface StudyRoom {
  id: string;
  name: string;
  hostId: number;
  hostUsername: string;
  participants: Map<number, { id: number; username: string; socketId: string }>;
  createdAt: Date;
}

interface LiveQuizSession {
  quizId: number;
  roomId: string;
  participants: Map<number, { id: number; username: string; score?: number; answers?: any }>;
  started: boolean;
  startTime?: Date;
}

/**
 * CollaborationGateway - WebSocket gateway for real-time collaborative features
 * 
 * Handles:
 * - Study room creation and management
 * - Real-time flashcard sharing
 * - Live quiz sessions
 * - Real-time progress updates
 * 
 * @class CollaborationGateway
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/collaboration',
})
@Injectable()
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private studyRooms: Map<string, StudyRoom> = new Map();
  private liveQuizSessions: Map<string, LiveQuizSession> = new Map();
  private userSockets: Map<number, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  /**
   * Handle client connection
   * Authenticates user via JWT token
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
      });

      const user = await this.usersService.findById(payload.id);
      if (!user) {
        client.disconnect();
        return;
      }

      client.userId = user.id;
      client.username = user.username;

      // Track user's sockets
      if (!this.userSockets.has(user.id)) {
        this.userSockets.set(user.id, new Set());
      }
      this.userSockets.get(user.id)!.add(client.id);

      console.log(`✅ User connected: ${user.username} (${user.id}) - Socket: ${client.id}`);
      
      // Notify user of successful connection
      client.emit('connected', {
        userId: user.id,
        username: user.username,
        message: 'Connected to collaboration server',
      });
    } catch (error) {
      console.error('❌ Connection error:', error);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // Remove from user sockets
      const sockets = this.userSockets.get(client.userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(client.userId);
        }
      }

      // Remove from study rooms
      this.studyRooms.forEach((room, roomId) => {
        if (room.participants.has(client.userId!)) {
          room.participants.delete(client.userId!);
          this.server.to(roomId).emit('participant-left', {
            userId: client.userId,
            username: client.username,
            roomId,
          });

          // If host left, close room
          if (room.hostId === client.userId) {
            this.server.to(roomId).emit('room-closed', { roomId });
            this.studyRooms.delete(roomId);
          }
        }
      });

      console.log(`👋 User disconnected: ${client.username} (${client.userId})`);
    }
  }

  /**
   * Create a new study room
   */
  @SubscribeMessage('create-room')
  handleCreateRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomName: string },
  ) {
    if (!client.userId) {
      return { error: 'Not authenticated' };
    }

    const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const room: StudyRoom = {
      id: roomId,
      name: data.roomName || `Study Room ${roomId}`,
      hostId: client.userId,
      hostUsername: client.username || 'Unknown',
      participants: new Map(),
      createdAt: new Date(),
    };

    room.participants.set(client.userId, {
      id: client.userId,
      username: client.username || 'Unknown',
      socketId: client.id,
    });

    this.studyRooms.set(roomId, room);
    client.join(roomId);

    console.log(`🏠 Room created: ${roomId} by ${client.username}`);

    return {
      success: true,
      room: {
        id: room.id,
        name: room.name,
        hostId: room.hostId,
        hostUsername: room.hostUsername,
        participantCount: room.participants.size,
        createdAt: room.createdAt,
      },
    };
  }

  /**
   * Join a study room
   */
  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    if (!client.userId) {
      return { error: 'Not authenticated' };
    }

    const room = this.studyRooms.get(data.roomId);
    if (!room) {
      return { error: 'Room not found' };
    }

    if (room.participants.has(client.userId)) {
      return { error: 'Already in room' };
    }

    room.participants.set(client.userId, {
      id: client.userId,
      username: client.username || 'Unknown',
      socketId: client.id,
    });

    client.join(data.roomId);

    // Notify all participants
    this.server.to(data.roomId).emit('participant-joined', {
      userId: client.userId,
      username: client.username,
      roomId: data.roomId,
      participantCount: room.participants.size,
    });

    console.log(`👤 ${client.username} joined room: ${data.roomId}`);

    return {
      success: true,
      room: {
        id: room.id,
        name: room.name,
        hostId: room.hostId,
        hostUsername: room.hostUsername,
        participantCount: room.participants.size,
        participants: Array.from(room.participants.values()),
      },
    };
  }

  /**
   * Leave a study room
   */
  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    if (!client.userId) return { error: 'Not authenticated' };

    const room = this.studyRooms.get(data.roomId);
    if (!room) return { error: 'Room not found' };

    room.participants.delete(client.userId);
    client.leave(data.roomId);

    this.server.to(data.roomId).emit('participant-left', {
      userId: client.userId,
      username: client.username,
      roomId: data.roomId,
      participantCount: room.participants.size,
    });

    // If host left, close room
    if (room.hostId === client.userId) {
      this.server.to(data.roomId).emit('room-closed', { roomId: data.roomId });
      this.studyRooms.delete(data.roomId);
    }

    return { success: true };
  }

  /**
   * Share a flashcard in a study room
   */
  @SubscribeMessage('share-flashcard')
  handleShareFlashcard(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; flashcard: any },
  ) {
    if (!client.userId) return { error: 'Not authenticated' };

    const room = this.studyRooms.get(data.roomId);
    if (!room || !room.participants.has(client.userId)) {
      return { error: 'Not in room' };
    }

    // Broadcast flashcard to all room participants
    this.server.to(data.roomId).emit('flashcard-shared', {
      from: {
        userId: client.userId,
        username: client.username,
      },
      flashcard: data.flashcard,
      roomId: data.roomId,
      timestamp: new Date(),
    });

    return { success: true };
  }

  /**
   * Start a live quiz session
   */
  @SubscribeMessage('start-live-quiz')
  handleStartLiveQuiz(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; quizId: number },
  ) {
    if (!client.userId) return { error: 'Not authenticated' };

    const room = this.studyRooms.get(data.roomId);
    if (!room || room.hostId !== client.userId) {
      return { error: 'Only host can start quiz' };
    }

    const session: LiveQuizSession = {
      quizId: data.quizId,
      roomId: data.roomId,
      participants: new Map(),
      started: false,
    };

    // Add all room participants to quiz session
    room.participants.forEach((participant) => {
      session.participants.set(participant.id, {
        id: participant.id,
        username: participant.username,
      });
    });

    this.liveQuizSessions.set(data.roomId, session);

    this.server.to(data.roomId).emit('live-quiz-started', {
      quizId: data.quizId,
      roomId: data.roomId,
      hostId: client.userId,
      participantCount: session.participants.size,
    });

    return { success: true, session };
  }

  /**
   * Submit answer in live quiz
   */
  @SubscribeMessage('submit-quiz-answer')
  handleSubmitQuizAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; questionIndex: number; answer: number },
  ) {
    if (!client.userId) return { error: 'Not authenticated' };

    const session = this.liveQuizSessions.get(data.roomId);
    if (!session || !session.participants.has(client.userId)) {
      return { error: 'Not in quiz session' };
    }

    const participant = session.participants.get(client.userId)!;
    if (!participant.answers) {
      participant.answers = {};
    }
    participant.answers[data.questionIndex] = data.answer;

    // Broadcast answer submission (without revealing answer)
    this.server.to(data.roomId).emit('quiz-answer-submitted', {
      userId: client.userId,
      username: client.username,
      questionIndex: data.questionIndex,
      roomId: data.roomId,
    });

    return { success: true };
  }

  /**
   * End live quiz and show results
   */
  @SubscribeMessage('end-live-quiz')
  handleEndLiveQuiz(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; results: any },
  ) {
    if (!client.userId) return { error: 'Not authenticated' };

    const session = this.liveQuizSessions.get(data.roomId);
    if (!session) return { error: 'Session not found' };

    const room = this.studyRooms.get(data.roomId);
    if (!room || room.hostId !== client.userId) {
      return { error: 'Only host can end quiz' };
    }

    // Broadcast results to all participants
    this.server.to(data.roomId).emit('live-quiz-results', {
      results: data.results,
      roomId: data.roomId,
      timestamp: new Date(),
    });

    this.liveQuizSessions.delete(data.roomId);

    return { success: true };
  }

  /**
   * Get list of active study rooms
   */
  @SubscribeMessage('get-rooms')
  handleGetRooms(@ConnectedSocket() client: AuthenticatedSocket) {
    const rooms = Array.from(this.studyRooms.values()).map((room) => ({
      id: room.id,
      name: room.name,
      hostId: room.hostId,
      hostUsername: room.hostUsername,
      participantCount: room.participants.size,
      createdAt: room.createdAt,
    }));

    return { success: true, rooms };
  }

  /**
   * Extract JWT token from socket handshake
   */
  private extractToken(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Also check query parameter
    const token = client.handshake.query.token as string;
    return token || null;
  }
}

