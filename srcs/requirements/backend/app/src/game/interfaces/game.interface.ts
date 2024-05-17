import { UserPreview } from 'src/user/interfaces/user.interface';
import { Server, BroadcastOperator } from 'socket.io';

export interface GameSession {
  ready: number;
  lock: boolean;
  room: Room;
  modifyLock: boolean;
  player: Player;
  score: Score;
  gameState: GameState;
  ballPhysics: BallPhysics;
  isGoal: boolean;
}

export interface Room {
  server: Server;
  player: BroadcastOperator<any, any>;
  viewer: BroadcastOperator<any, any>;
  matchHistory: BroadcastOperator<any, any>;
  ladder: BroadcastOperator<any, any>;
}

export interface Player {
  home: string;
  foreign: string;
}

export interface Score {
  home: number;
  foreign: number;
}

export interface GameState {
  homeY: number;
  foreignY: number;
  ballX: number;
  ballY: number;
}

export interface BallPhysics {
  vector: Vector;
  speed: number;
  nextHit: NextHit;
}

export interface Vector {
  x: number;
  y: number;
}

export interface NextHit {
  roundsUntilHit: number;
  roundPartLeft: number;
  border: number;
}

export interface Matched {
  id: string;
  homePlayer: UserPreview;
  foreignPlayer: UserPreview;
}
