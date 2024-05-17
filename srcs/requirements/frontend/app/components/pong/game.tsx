import '../../styles/game.css';
import { SocketContext } from '@/contexts/SocketContext';
import React, { useContext, useEffect, useState } from 'react';

interface GameStateBody {
  homeY: number;
  foreignY: number;
  ballX: number;
  ballY: number;
}

interface GameScoreBody {
  home: number;
  foreign: number;
}

interface PongGameProps {
  matchId: string;
  onGameOver: () => void;
}

const Game: React.FC<PongGameProps> = ({ matchId, onGameOver }) => {
  const { socket } = useContext(SocketContext);
  const [homePaddlePosition, setHomePaddlePosition] = useState(50);
  const [foreignPaddlePosition, setForeignPaddlePosition] = useState(50);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [homeScore, setHomeScore] = useState(0);
  const [foreignScore, setForeignScore] = useState(0);

  useEffect(() => {
    let handleMouseMove: ((event: MouseEvent) => void) | null = null;

    const cleanup = () => {
      if (handleMouseMove) {
        document.removeEventListener('mousemove', handleMouseMove);
      }
    };

    if (socket && matchId) {
      // socket.on('error', (error: any) => {
      //   console.log('error: ', error);
      // });

      socket.emit('startGame', {
        id: matchId,
      })

      handleMouseMove = ((event: MouseEvent) => {
        const mouseY = event.clientY;
        const height = window.innerHeight;
        const relativeY = mouseY / height;
    
        socket.emit('updatePaddlePosition', {
          matchId: matchId,
          y: relativeY,
        });
      });

      socket.on('gameStarted', () => {
        document.addEventListener('mousemove', handleMouseMove as ((event: MouseEvent) => void));
      });
      socket.on('gameOver', () => {
        cleanup;
        onGameOver();
      });

      socket.on('gameStateUpdate', (gameState: GameStateBody) => {
        setHomePaddlePosition(gameState.homeY * 100);
        setForeignPaddlePosition(gameState.foreignY * 100);
        setBallPosition({ x: gameState.ballX * 100, y: gameState.ballY * 100 });
      });
      socket.on('gameScoreUpdate', (gameScore: GameScoreBody) => {
        setHomeScore(gameScore.home);
        setForeignScore(gameScore.foreign);
      });

      return (() => {
        cleanup();
        socket.off('gameStarted');
        socket.off('gameOver');
        socket.off('gameStateUpdate');
        socket.off('gameScoreUpdate');
        // socket.off('error');
      });
    }
  }, [matchId, socket, onGameOver]);

  return (
    <div>
      <div className="game-container">
        <div className="score">
          <div>{homeScore}</div>
          <div>{foreignScore}</div>
        </div>
        <div className="paddle home" style={{ top: `${homePaddlePosition}vh` }} />
        <div className="paddle foreign" style={{ top: `${foreignPaddlePosition}vh` }} />
        <div className="ball" style={{ left: `${ballPosition.x}vw`, top: `${ballPosition.y}vh` }} />
      </div>
    </div>
  );
};

export default Game;
