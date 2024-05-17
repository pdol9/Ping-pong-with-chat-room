import { SocketContext } from '@/contexts/SocketContext';
import React, { useContext, useState } from 'react';
import GameQueue, { Matched } from '@/components/pong/queue';
import '../../app/globals.css';
import AuthLayout from '@/layouts/auth';
import { useRouter } from 'next/router';

const GameInterface = () => {
  const { socket } = useContext(SocketContext);
  const router = useRouter();
  const [isQueued, setIsQueued] = useState(false);

  const handleJoinQueue = () => {
    if (socket) {
      setIsQueued(true);
      socket.emit('joinMatchmaking');
    }
  }

  const handleLeaveQueue = () => {
    if (socket) {
      setIsQueued(false);
      socket.emit('leaveMatchmaking');
    }
  }

  const handleQueuePop = (matched: Matched) => {
    router.push(`/game/${matched.id}?homePlayer=${matched.homePlayer.nickname}&foreignPlayer=${matched.foreignPlayer.nickname}`);
  }

  const handleStartTraining = () => {
    router.push('/game/training');
  };

  return (
    <AuthLayout>
      {isQueued ? (
        <GameQueue onLeaveQueue={handleLeaveQueue} onQueuePop={handleQueuePop} />
      ) : (
          <div style={{border: '5px solid black', marginLeft: '400px', marginRight: '400px', marginTop: '400px' }}>
			<div style={{  display: 'flex' , flexDirection: 'column', alignItems: 'center' }}>
				<h1 style={{ color: 'red', fontSize: '24px'}}>Pong Game</h1>
				<button style={{ color: 'green', fontSize: '30px', padding: '20px', border: '2px solid white', marginTop: '20px', marginBottom: '20px' }} onClick={handleStartTraining}>Start Training</button>
				<button style={{ color: 'green', fontSize: '30px', padding: '20px', border: '2px solid white', marginTop: '20px', marginBottom: '20px' }} onClick={handleJoinQueue}>Start Game</button>
            </div>
		  </div>
      )}
    </AuthLayout>
  );
};

export default GameInterface;
