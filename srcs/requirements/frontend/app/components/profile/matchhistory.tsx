import React, { useState, useEffect, useContext } from 'react';
import '../../styles/profile.css';
import UserPreview, { User } from '../userPreview';
import { SocketContext } from '@/contexts/SocketContext';
import api from '@/utils/axios';

interface Match {
  id: string;
  homePlayer: User;
  foreignPlayer: User;
  homeScore: number;
  foreignScore: number;
  created_at: Date;
}

interface MatchHistoryProps {
  login: string;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ login }) => {
  const { socket } = useContext(SocketContext);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (login) {
      const getMatchHistory = () => {
        api
          .get(`/match/history/${login}`)
          .then(response => {
            setMatches(response.data.matches);
          })
          .catch(error => {
            // console.log('error match history: ', error);
          })
      }

      getMatchHistory();

      if (socket) {
        // socket.on('error', (error: any) => {
        //   console.log('error: ', error);
        // });

        socket.emit('manageUserMatchHistoryRoom', {
          userLogin: login,
          action: 'join',
        });

        socket.on('newMatch', (match: Match) => {
          setMatches((prevMatches) => [...prevMatches, match]);
        });

        return (() => {
          socket.off('newMatch');
          socket.emit('manageUserMatchHistoryRoom', {
            userLogin: login,
            action: 'leave',
          });
        });
      }
    }
  }, [login, socket]);

  return (
    <div className="profile-achievements" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
		<div>
      <h1 style={{ fontWeight: 'bold', textAlign: 'center', color: 'grey' }}>Match History</h1>
	  </div>
	  <div style={{ overflow: 'auto', maxHeight: '180px', maxWidth: '500px', marginTop: '120px' }}>
      {matches && matches.map((match: Match) => (
        <li style={{ color: 'orange' }} key={match.id}>
          <h3>{match.id}</h3>
          <UserPreview user={match.homePlayer} />
          <p>{match.homeScore}:{match.foreignScore}</p>
          <UserPreview user={match.foreignPlayer} />
        </li>
      ))}
	  </div>
    </div>
  );
}

export default MatchHistory;