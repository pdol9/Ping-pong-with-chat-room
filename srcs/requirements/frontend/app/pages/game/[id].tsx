import GameResults from '@/components/pong/results';
import { SocketContext } from '@/contexts/SocketContext';
import React, { useContext, useEffect, useState } from 'react';
import Game from '@/components/pong/game';
import Loading from '@/components/loading';
import '../../app/globals.css';
import { AuthContext } from '@/contexts/AuthContext';
import AuthLayout from '@/layouts/auth';
import { useRouter } from 'next/router';
import GamePreview from '@/components/pong/preview';
import NotFoundError from '@/components/error/notFoundError';
import useSessionValidation from '@/hooks/sessionValidation';
import api from '@/utils/axios';

const PongGame = () => {
  useSessionValidation();

  const { isAuthenticated } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const router = useRouter();
  const { id } = router.query;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [idValue, setIdValue] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (socket) {
      // socket.on('error', (error: any) => {
      //   console.log('error: ', error);
      // });

      const getMatch = () => {
        api
          .get(`/match/${id}`)
          .then(() => {
            setIsError(true);
            router.push('/game');
          })
          .catch(() => {
            if (typeof id === 'string') {
              setIdValue(id);
            } else if (Array.isArray(id)) {
              setIdValue(id[0]);
            }
            if (idValue) {
              socket.emit("manageMatchRoom", {
                matchId: idValue,
                action: "join"
              });
            }
            setIsError(false);
          })
      }

      getMatch();

      return (() => {
        // socket.off('error');
        if (idValue) {
          socket.emit("manageMatchRoom", {
            matchId: idValue,
            action: "leave"
          });
        }
      })
    }
  }, [id, socket, idValue, router]);

  const handleGameOver = () => {
    setIsPlaying(false);
    setIsGameOver(true);
  }

  const handleGameStart = () => {
    setIsPlaying(true);
  }

  const handleCloseResults = () => {
    router.push('/game');
  }

  if (isError === true) {
    return (
      <AuthLayout>
        <NotFoundError />
      </AuthLayout>
    );
  } else if (isAuthenticated === true && idValue) {
    return (
      <div>
        {isPlaying ? (
          <Game matchId={idValue} onGameOver={handleGameOver} />
        ) : (
        <AuthLayout>
          {isGameOver ? (
            <GameResults onCloseResults={handleCloseResults}/>
          ) : (
            <GamePreview onGameStart={handleGameStart} />
          )}
        </AuthLayout>
        )}
      </div>
    );
  } else {
    return (
      <AuthLayout>
        <Loading />
      </AuthLayout>
    );
  }
};

export default PongGame;
