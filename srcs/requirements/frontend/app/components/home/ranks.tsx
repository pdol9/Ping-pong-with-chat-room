import React, { useState, useEffect, useContext } from 'react';
import '../../styles/profile.css';
import UserPreview, { User } from '../userPreview';
import api from '@/utils/axios';
import { SocketContext } from '@/contexts/SocketContext';

const Ranks: React.FC = () => {
  const { socket } = useContext(SocketContext);
  const [users, setUsers] = useState<User[]>([]);

  useEffect ( () => {
    const getRanksData = () => {
      api
        .get('/users/rank')
        .then (response => {
          setUsers(response.data.users);
        })
        .catch(error => {
          // console.log('error getRanksData: ', error);
        });
    }

    getRanksData();

    if (socket) {
      // socket.on('error', (error: any) => {
      //   console.log('error: ', error);
      // });

    socket.emit('manageLadderRoom', {
        action: 'join',
      });

      socket.on('updatedLadder', rank => {
        setUsers(rank.users);
      })
    }

    return (() => {
      if (socket) {
        socket.off('updatedLadder');
        socket.emit('manageLadderRoom', {
          action: 'leave',
        });
      }
    })
  }, [socket]);

  return (
    <div>	
      
	  <div>
	  <h1 style={{  color: 'white'}}><b>Ranking List:</b></h1>
      <ol>
	  <div style={{ overflow: 'auto', maxHeight: '200px', maxWidth: '300px' }}>
        {users && users.map((user: User, index: number) => (
          <li key={user.login} value={index + 1} style={{ color: 'yellow'}}>
            <span><strong>Number {index + 1}:  </strong></span>
            <UserPreview key={user.login} user={user} />
          </li>
        ))}
		</div>
      </ol>
	  </div>
    </div>
  );
}

export default Ranks;