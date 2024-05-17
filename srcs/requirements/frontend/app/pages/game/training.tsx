import '../../styles/game.css';
import React, { useEffect, useRef, useState } from 'react';
import Ball from '../../dust/Ball';
import Paddle from '../../dust/paddles';
import { useRouter } from 'next/router';
import '../../app/globals.css';


const PongTraining = () => {
  const ballRef = useRef<HTMLDivElement | null>(null);
  const playerPaddleRef = useRef<HTMLDivElement | null>(null);
  const computerPaddleRef = useRef<HTMLDivElement | null>(null);
  const playerScoreRef = useRef<HTMLDivElement | null>(null);
  const computerScoreRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const [playerPaddlePosition, setPlayerPaddlePosition] = useState<number>(50);

  const router = useRouter(); 

  useEffect(() => {
    const ballElement = ballRef.current as HTMLDivElement | null;
    const ball = new Ball(ballElement as HTMLDivElement);
    const playerPaddle = new Paddle(playerPaddleRef.current as HTMLDivElement);
    const computerPaddle = new Paddle(computerPaddleRef.current as HTMLDivElement);
    const playerScoreElem = playerScoreRef.current as HTMLDivElement;
    const computerScoreElem = computerScoreRef.current as HTMLDivElement;

  function update(time: number) {
    if (lastTime) {
      const delta: number = time - lastTime;
      ball.update(delta, [playerPaddle.rect(), computerPaddle.rect()]);
      computerPaddle.update(delta, ball.y);
      if (pointMade()) {
      resetGame();
      }
    }
    lastTime = time;
    requestRef.current = requestAnimationFrame(update);
    }

    function resetGame() {
    const rect : {
      left: number;
      top: number;
      right: number;
      bottom: number;
      } = ball.rect();
    if (rect.right >= window.innerWidth) {
      // console.log('you win'); // ?: optional chaining. prevents error when element is null
      if (playerScoreElem?.textContent !== null)
      playerScoreElem.textContent = (parseInt(playerScoreElem.textContent) + 1).toString();
    } else if (rect.left <= 0) {
      // console.log('you lose');
      if (computerScoreElem?.textContent !== null)
      computerScoreElem.textContent = (parseInt(computerScoreElem.textContent) + 1).toString();
    }
    ball.reset();
    computerPaddle.reset();
    }

    function pointMade() {
    const rect = ball.rect();
    return rect.right >= window.innerWidth || rect.left <= 0;
    }
  
    let lastTime: number;
  
    requestRef.current = requestAnimationFrame(update);
  
    const handleMouseMove = (e: MouseEvent) => {
    const position = (e.clientY / window.innerHeight) * 100;
    setPlayerPaddlePosition(position);
    };
  
    document.addEventListener("mousemove", handleMouseMove);
  
    return () => {
    cancelAnimationFrame(requestRef.current as number);
    document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleQuitTraining = () => {
    router.push('/game');
  }

  return (
    <div className="game-container">
    <div className="score">
      <div ref={playerScoreRef}>0</div>
      <div ref={computerScoreRef}>0</div>
    </div>

    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <button style={{ fontWeight: 'bold', color: 'yellow', background: 'black'}} onClick={handleQuitTraining}>Quit Training</button>
      </div>
  
    <div className="ball" ref={ballRef}></div>
    <div
      className="paddle home"
      ref={playerPaddleRef}
      style={{ top: `${playerPaddlePosition}vh` }}
    ></div>
    <div className="paddle foreign" ref={computerPaddleRef}></div>
    </div>
  );
  }
  
  export default PongTraining;