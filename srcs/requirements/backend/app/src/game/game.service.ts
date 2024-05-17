import { Injectable } from '@nestjs/common';
import { Matched, Room, Score } from './interfaces/game.interface';
import { v4 as uuidv4 } from 'uuid';
import UpdatePaddelPositionDto from './dto/update-paddle-position.dto';
import { UserService } from 'src/user/user.service';
import {
  BallPhysics,
  GameSession,
  GameState,
  NextHit,
  Player,
  Vector,
} from './interfaces/game.interface';
import { MatchService } from './match.service';
import { Server } from 'socket.io';
import { StatsService } from 'src/user/stats.service';
import { RankPreview } from 'src/user/interfaces/user.interface';

const loopInterval = 1000 / 60; // 60 FPS
const ballSpeedUnit = 0.005;
const ballVectorLength = 1;
const ballRadius = 0.0125;
const paddelWidth = 0.01;
const paddelLength = 0.1;
const maxScore = 3;
const homeScored = 1;
const foreignScored = 1;
const minWidth = 0;
const maxWidth = 1;
const minHeight = 0;
const maxHeight = 1;
enum ballEvent {
  offside,
  blocked,
  goal,
}
enum fieldBorder {
  left,
  right,
  top,
  bottom,
}

@Injectable()
export class GameService {
  constructor(
    private readonly userService: UserService,
    private readonly statsService: StatsService,
    private readonly matchService: MatchService,
  ) {}

  private gameSessions: Map<string, GameSession> = new Map<
    string,
    GameSession
  >();

  async joinMatchRoom(server: Server, player: Player) {
    const matchId = uuidv4();
    const room = await this.initializeRoom(server, player, matchId);
    const score = this.initializeScore();
    const gameState = this.initializeGameState();
    const ballPhysics = this.initializeBallPhysics(gameState);

    const gameSession: GameSession = {
      ready: 0,
      lock: false,
      room: room,
      modifyLock: false,
      player: player,
      score: score,
      gameState: gameState,
      ballPhysics: ballPhysics,
      isGoal: false,
    };
    this.gameSessions.set(matchId, gameSession);

    await this.emitMatched(matchId, gameSession);
  }

  async startGame(matchId: string) {
    const session = this.gameSessions.get(matchId);
    session.ready += 1;
    if (session.ready === 2 && !session.lock) {
      session.lock = true;
      this.emitGameStarted(session);
      this.gameLoop(session, async () => {
        await this.gameOver(matchId, session);
      });
    }
  }

  private async initializeRoom(
    server: Server,
    player: Player,
    matchId: string,
  ) {
    const home = await this.userService.findByLogin(player.home);
    const foreign = await this.userService.findByLogin(player.foreign);
    const room: Room = {
      server: server,
      player: server.to([home.socketId, foreign.socketId]),
      viewer: server.to(`match_${matchId}`),
      matchHistory: server.to([
        `userMatchHistory_${player.home}`,
        `userMatchHistory_${player.foreign}`,
      ]),
      ladder: server.to('ladder'),
    };
    return room;
  }

  private initializeScore() {
    const score: Score = {
      home: 0,
      foreign: 0,
    };
    return score;
  }

  private initializeGameState() {
    const gameState: GameState = {
      homeY: 0.5,
      foreignY: 0.5,
      ballX: 0.5,
      ballY: 0.5,
    };
    return gameState;
  }

  private initializeBallPhysics(gameState: GameState) {
    const vector = this.initializeBallVector();
    const speed = 1 * ballSpeedUnit;
    const nextHit = this.getNextHit(gameState, vector, speed, 1);

    const ballPhysics: BallPhysics = {
      vector: vector,
      speed: speed,
      nextHit: nextHit,
    };
    return ballPhysics;
  }

  private initializeBallVector() {
    let initialX = this.randomizeSign(this.randomNumberLimits(0.2, 0.8));
    let initialY = this.randomizeSign(this.randomNumberLimits(0.2, 0.8));
    const modifier =
      Math.sqrt(initialX ** 2 + initialY ** 2) / ballVectorLength;
    initialX /= modifier;
    initialY /= modifier;

    const vector: Vector = {
      x: initialX,
      y: initialY,
    };
    return vector;
  }

  private randomNumberLimits(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  private randomizeSign(number: number) {
    const random = Math.random();
    const sign = random < 0.5 ? -1 : 1;
    return number * sign;
  }

  private getNextHit(
    gameState: GameState,
    vector: Vector,
    speed: number,
    roundPartLeft: number,
  ) {
    let xRoundsUntilHit: number;
    let yRoundsUntilHit: number;
    let xBorder: number;
    let yBorder: number;

    if (this.movesLeft(vector.x)) {
      xBorder = fieldBorder.left;
      xRoundsUntilHit = this.getRoundsUntilHitBorder(
        minWidth + (ballRadius + paddelWidth),
        gameState.ballX,
        vector.x,
        speed,
      );
    } else {
      xBorder = fieldBorder.right;
      xRoundsUntilHit = this.getRoundsUntilHitBorder(
        maxWidth - (ballRadius + paddelWidth),
        gameState.ballX,
        vector.x,
        speed,
      );
    }
    if (this.movesUp(vector.y)) {
      yBorder = fieldBorder.top;
      yRoundsUntilHit = this.getRoundsUntilHitBorder(
        minHeight + ballRadius,
        gameState.ballY,
        vector.y,
        speed,
      );
    } else {
      yBorder = fieldBorder.bottom;
      yRoundsUntilHit = this.getRoundsUntilHitBorder(
        maxHeight - ballRadius,
        gameState.ballY,
        vector.y,
        speed,
      );
    }

    const roundsUntilHit = this.getSmallestOf(xRoundsUntilHit, yRoundsUntilHit);
    const border = roundsUntilHit === xRoundsUntilHit ? xBorder : yBorder;
    const nextHit: NextHit = {
      roundsUntilHit: roundsUntilHit,
      roundPartLeft: roundPartLeft,
      border: border,
    };
    return nextHit;
  }

  private movesLeft(vectorX: number) {
    return vectorX < 0;
  }
  private movesUp(vectorY: number) {
    return vectorY < 0;
  }

  private getRoundsUntilHitBorder(
    borderCoordinate: number,
    ballStateCoordinate: number,
    ballVectorCoordinate: number,
    ballSpeed: number,
  ) {
    return (
      (borderCoordinate - ballStateCoordinate) /
      (ballVectorCoordinate * ballSpeed)
    );
  }

  private getSmallestOf(nbr1: number, nbr2: number) {
    return nbr1 < nbr2 ? nbr1 : nbr2;
  }

  private gameLoop(session: GameSession, callback: () => void) {
    this.lockSession(session);
    this.calculateBallPosition(session);
    if (this.isGameOver(session)) {
      this.unlockSession(session);
      callback();
      return ;
    }
    if (session.isGoal) {
      this.handleGoal(session);
    }
    this.unlockSession(session);
    this.emitGameState(session);
    setTimeout(() => {
      this.gameLoop(session, callback);
    }, loopInterval);
  }

  private lockSession(session: GameSession) {
    while (session.modifyLock) {}
    session.modifyLock = true;
  }

  private unlockSession(session: GameSession) {
    session.modifyLock = false;
  }

  private calculateBallPosition(session: GameSession) {
    const event = this.getBallEvent(
      session.gameState,
      session.ballPhysics.nextHit,
    );

    this.setBall(session.gameState, session.ballPhysics);
    switch (event) {
      case ballEvent.offside:
        this.handleOffsideEvent(session.ballPhysics);
        break;
      case ballEvent.blocked:
        this.handleBlockedEvent(session.ballPhysics);
        break;
      case ballEvent.goal:
        this.handleGoalEvent(session);
        return;
      default:
        this.handleMoveEvent(session.ballPhysics);
        return;
    }
    session.ballPhysics.nextHit = this.getNextHit(
      session.gameState,
      session.ballPhysics.vector,
      session.ballPhysics.speed,
      session.ballPhysics.nextHit.roundPartLeft,
    );
    this.calculateBallPosition(session);
  }

  private getBallEvent(gameState: GameState, nextHit: NextHit) {
    if (this.isBorderHit(nextHit)) {
      if (this.isOffsideEvent(nextHit.border)) {
        return ballEvent.offside;
      }
      if (this.isBlockedEvent(nextHit.border, gameState)) {
        return ballEvent.blocked;
      }
      if (this.isGoalEvent(nextHit.border, gameState)) {
        return ballEvent.goal;
      }
    }
    return undefined;
  }

  private isBorderHit(nextHit: NextHit) {
    return nextHit.roundsUntilHit < nextHit.roundPartLeft;
  }

  private isOffsideEvent(border: fieldBorder) {
    return this.isHorizontal(border);
  }

  private isBlockedEvent(border: fieldBorder, gameState: GameState) {
    if (this.isVertical(border)) {
      return this.isPaddelHit(border, gameState);
    }
  }

  private isGoalEvent(border: fieldBorder, gameState: GameState) {
    if (this.isVertical(border)) {
      return !this.isPaddelHit(border, gameState);
    }
  }

  private isPaddelHit(border: fieldBorder, gameState: GameState) {
    let playerY: number = 0;

    if (border === fieldBorder.left) {
      playerY = gameState.homeY;
    }
    if (border === fieldBorder.right) {
      playerY = gameState.foreignY;
    }
    return Math.abs(playerY - gameState.ballY) < paddelLength / 2;
  }

  private isHorizontal(border: fieldBorder) {
    return border === fieldBorder.top || border === fieldBorder.bottom;
  }

  private isVertical(border: fieldBorder) {
    return this.isLeft(border) || this.isRight(border);
  }

  private isLeft(border: fieldBorder) {
    return border === fieldBorder.left;
  }

  private isRight(border: fieldBorder) {
    return border === fieldBorder.right;
  }

  private setBall(gameState: GameState, ballPhysics: BallPhysics) {
    const modifier = this.getSmallestOf(ballPhysics.nextHit.roundsUntilHit, 1);
    gameState.ballX += ballPhysics.vector.x * ballPhysics.speed * modifier;
    gameState.ballY += ballPhysics.vector.y * ballPhysics.speed * modifier;
  }

  private handleOffsideEvent(ballPhysics: BallPhysics) {
    this.decrementRoundPartLeft(ballPhysics.nextHit);
    this.redirectBall(ballPhysics);
  }

  private handleBlockedEvent(ballPhysics: BallPhysics) {
    this.decrementRoundPartLeft(ballPhysics.nextHit);
    this.redirectBall(ballPhysics);
    this.speedUpBall(ballPhysics);
  }

  private handleGoalEvent(session: GameSession) {
    session.isGoal = true;
    if (this.isRight(session.ballPhysics.nextHit.border)) {
      session.score.home += homeScored;
    }
    if (this.isLeft(session.ballPhysics.nextHit.border)) {
      session.score.foreign += foreignScored;
    }
  }

  private handleMoveEvent(ballPhysics: BallPhysics) {
    this.decrementRoundsUntilHit(ballPhysics.nextHit);
    this.resetRoundPartLeft(ballPhysics.nextHit);
  }

  private decrementRoundsUntilHit(nextHit: NextHit) {
    nextHit.roundsUntilHit -= nextHit.roundPartLeft;
  }

  private decrementRoundPartLeft(nextHit: NextHit) {
    nextHit.roundPartLeft -= nextHit.roundsUntilHit;
  }

  private resetRoundPartLeft(nextHit: NextHit) {
    nextHit.roundPartLeft = 1;
  }

  private redirectBall(ballPhysics: BallPhysics) {
    if (this.isHorizontal(ballPhysics.nextHit.border)) {
      this.modifyVector(ballPhysics.vector, 1, -1);
    }
    if (this.isVertical(ballPhysics.nextHit.border)) {
      this.modifyVector(ballPhysics.vector, -1, 1);
    }
  }

  private speedUpBall(ballPhysics: BallPhysics) {
    ballPhysics.speed += ballSpeedUnit;
  }

  private modifyVector(vector: Vector, xModifier: number, yModifier: number) {
    vector.x *= xModifier;
    vector.y *= yModifier;
  }

  private isGameOver(session: GameSession) {
    return (
      session.isGoal &&
      (session.score.home >= maxScore ||
      session.score.foreign >= maxScore)
    );
  }

  private async gameOver(matchId: string, session: GameSession) {
    this.emitGameOver(session);
    await this.matchService.createMatch(matchId, session);
    setTimeout(() => {}, 500);
    await this.emitGameResults(matchId, session);
    await this.emitNewMatch(matchId, session);
    await this.updateStats(session);
    this.gameSessions.delete(matchId);
  }

  private async updateStats(session: GameSession) {
    await this.updateLocalStats(session.player.home, session.score.home);
    await this.updateLocalStats(session.player.foreign, session.score.foreign);
    await this.emitStatsUpdate(session.player.home, session);
    await this.emitStatsUpdate(session.player.foreign, session);
    const ladder = await this.updateLadder(session);
    this.emitLadderUpdate(session, ladder);
  }

  private async updateLadder(session: GameSession) {
    const users = await this.userService.getLadder();
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      user.stats.rank = i + 1;

      await this.statsService.saveStats(user.stats);
      await this.emitStatsUpdate(user.login, session);
    }
    return this.userService.getRankPreview(users);
  }

  private async updateLocalStats(login: string, score: number) {
    const user = await this.userService.findByLogin(login, {
      stats: true,
    });
    if (score === maxScore) {
      user.stats.xp += 3;
      user.stats.wins += 1;
    } else if (score < maxScore) {
      user.stats.xp += 1;
      user.stats.losses += 1;
    }
    await this.statsService.saveStats(user.stats);
  }

  private async emitStatsUpdate(login: string, session: GameSession) {
    session.room.server
      .to(`userStats_${login}`)
      .emit('updatedStats', await this.statsService.getStats(login));
  }

  private emitLadderUpdate(session: GameSession, ladder: RankPreview) {
    session.room.ladder.emit('updatedLadder', ladder);
  }

  private handleGoal(session: GameSession) {
    this.emitGameScoreUpdate(session);
    session.gameState = this.initializeGameState();
    session.ballPhysics = this.initializeBallPhysics(session.gameState);
    session.isGoal = false;
  }

  updatePaddlePosition(login: string, updateData: UpdatePaddelPositionDto) {
    const session = this.gameSessions.get(updateData.matchId);
    this.lockSession(session);
    if (this.isHomePlayer(login, updateData.matchId)) {
      this.setHomePlayerY(session.gameState, updateData.y);
    } else if (this.isForeignPlayer(login, updateData.matchId)) {
      this.setForeignPlayerY(session.gameState, updateData.y);
    }
    this.unlockSession(session);
  }

  private setHomePlayerY(gameState: GameState, y: number) {
    gameState.homeY = y;
  }

  private setForeignPlayerY(gameState: GameState, y: number) {
    gameState.foreignY = y;
  }

  async getMatched(matchId: string, session: GameSession) {
    const home = await this.userService.findByLogin(session.player.home);
    const foreign = await this.userService.findByLogin(session.player.foreign);
    const matched: Matched = {
      id: matchId,
      homePlayer: this.userService.getPreview(home),
      foreignPlayer: this.userService.getPreview(foreign),
    };
    return matched;
  }

  private async emitMatched(matchId: string, session: GameSession) {
    const matched = await this.getMatched(matchId, session);
    session.room.player.emit('matched', matched);
  }

  private emitGameStarted(session: GameSession) {
    session.room.player.emit('gameStarted');
  }

  private emitGameOver(session: GameSession) {
    session.room.viewer.emit('gameOver');
  }

  private async emitGameResults(matchId: string, session: GameSession) {
    const gameResults = await this.matchService.getGameResults(matchId);
    session.room.viewer.emit('gameResults', gameResults);
  }

  private async emitNewMatch(matchId: string, session: GameSession) {
    const newMatch = await this.matchService.getGameResults(matchId);
    session.room.matchHistory.emit('newMatch', newMatch);
  }

  private emitGameScoreUpdate(session: GameSession) {
    const score = session.score;
    session.room.viewer.emit('gameScoreUpdate', score);
  }

  private emitGameState(session: GameSession) {
    const gameState = session.gameState;
    session.room.viewer.emit('gameStateUpdate', gameState);
  }

  validateGameSession(matchId: string) {
    if (!this.isGameSession(matchId)) {
      throw new Error('no match session');
    }
  }

  validatePlayer(login: string, matchId: string) {
    if (!this.isPlayer(login, matchId)) {
      throw new Error('not a player');
    }
  }

  private isGameSession(matchId: string) {
    return this.gameSessions.get(matchId) !== undefined;
  }

  private isPlayer(login: string, matchId: string) {
    return (
      this.isHomePlayer(login, matchId) || this.isForeignPlayer(login, matchId)
    );
  }

  private isHomePlayer(login: string, matchId: string) {
    return login === this.gameSessions.get(matchId).player.home;
  }

  private isForeignPlayer(login: string, matchId: string) {
    return login === this.gameSessions.get(matchId).player.foreign;
  }
}
