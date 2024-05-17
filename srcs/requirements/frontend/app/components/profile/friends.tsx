import React, { useContext, useEffect, useState } from "react";
import UserPreview, { User } from "../userPreview";
import { SocketContext } from "@/contexts/SocketContext";
import api from "@/utils/axios";

interface PendingUser extends User {
  isReceiving: boolean;
}

interface FriendsProps {
  login: string;
  role: string;
}

const Friends: React.FC<FriendsProps> = ({ login, role }) => {
  const { socket } = useContext(SocketContext);
  const [friends, setFriends] = useState<User[]>([]);
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [blocked, setBlocked] = useState<User[]>([]);

  useEffect(() => {
    if (login) {
      const getUserFriends = () => {
        api
          .get(`/users/${login}/friends`)
          .then(response => {
            setFriends(response.data.friends);
            setPending(response.data.pending);
            setBlocked(response.data.blocked);
          })
          .catch(error => {
            // console.log('error friends: ', error);
          });
      };

      getUserFriends();

      if (socket) {
        // socket.on('error', (error: any) => {
        //   console.log('error: ', error);
        // });

        socket.emit('manageUserFriendsRoom', {
          userLogin: login,
          action: 'join',
        });

        if (role === 'owner') {
          socket.on('sentFriendRequest', (user: User) => {
            if (login !== user.login) {
              const pendingUser: PendingUser = {
                ...user,
                isReceiving: false,
              }
              setPending((prevPendingUsers) => prevPendingUsers.filter((usr) => usr.login !== user.login));
              setPending((prevPendingUsers) => [...prevPendingUsers, pendingUser]);
            }
          });
          socket.on('receivedFriendRequest', (user: User) => {
            if (login !== user.login) {
                const pendingUser: PendingUser = {
                ...user,
                isReceiving: true,
              }
              setPending((prevPendingUsers) => prevPendingUsers.filter((usr) => usr.login !== user.login));
              setPending((prevPendingUsers) => [...prevPendingUsers, pendingUser]);
            }
          });
        }
        socket.on('newFriend', (user: User) => {
          if (login !== user.login) {
            if (role === 'owner') {
              setPending((prevPendingUsers) => prevPendingUsers.filter((usr) => usr.login !== user.login));
            }
            setFriends((prevUsers) => prevUsers.filter((usr) => usr.login !== user.login));
            setFriends((prevUsers) => [...prevUsers, user]);
          }
        });
        socket.on('removedFriend', (user: User) => {
          if (login !== user.login) {
            if (role === 'owner') {
              setPending((prevPendingUsers) => prevPendingUsers.filter((usr) => usr.login !== user.login));
            }
            setFriends((prevUsers) => prevUsers.filter((usr) => usr.login !== user.login));
          }
        });
      }

      return () => {
        if (socket) {
          socket.off('sentFriendRequest');
          socket.off('receivedFriendRequest');
          socket.off('newFriend');
          socket.off('removedFriend');
          socket.emit('manageUserFriendsRoom', {
            userLogin: login,
            action: 'leave',
          });
        }
      }
    }
  }, [login, role, socket]);

  const handleRemoveFriend = (user: User) => {
    if (socket) {
      socket.emit('removeFriend', {
        login: user.login,
      })
    }
  }

  const handleConfirmFriend = (user: User) => {
    if (socket) {
      socket.emit('confirmFriend', {
        login: user.login,
      })
    }
  }

 /*
 * wrap infinite scroll component around userpreview
 */
 const BlockedSection: React.FC = () => (
	<div style={{ marginTop: '0px', marginLeft: '50px' }}>
      <h1 style={{ color: 'yellow' }}>Blocked</h1>
      <div style={{ overflow: 'auto', maxHeight: '180px', maxWidth: '100px' }}>
        {blocked && blocked.map((user: User) => (
          <li style={{ color: 'yellow' }} key={user.login}>
            <UserPreview key={user.login} user={user} />
          </li>
        ))}
      </div>
	  </div>
  );

  const PendingSection: React.FC = () => (
    <div style={{ marginTop: '0px', marginLeft: '50px' }}>
      <h1 style={{ color: 'green' }}>Pending</h1>
	  <div style={{ overflow: 'auto', maxHeight: '180px', maxWidth: '100px' }}>
      {pending && pending.map((user: PendingUser) => (
        <li style={{ color: 'yellow' }} key={user.login}>
          <UserPreview key={user.login} user={{
            login: user.login,
            nickname: user.nickname,
            status: user.status
          }} />
          {user.isReceiving && (
            <button onClick={() => handleConfirmFriend(user)}>accept</button>
          )}
          <button onClick={() => handleRemoveFriend(user)}>x</button>
        </li>
      ))}
    </div>
	</div>
  );

  const FriendsSection: React.FC = () => (
	<div style={{ marginTop: '0px', marginLeft: '50px' }}>
      <h1 style={{ color: 'red' }}>Friends</h1>
	  <div style={{ overflow: 'auto', maxHeight: '180px', maxWidth: '100px' }}>
      {friends && friends.map((user: User) => (
        <li style={{ color: 'yellow' }} key={user.login}>
          <UserPreview key={user.login} user={user} />
        </li>
      ))}
    </div>
	</div>
  );

  return (
    <div style={{ display: 'flex' }}>
      <div className="profile-friends">
        <FriendsSection />
        {role === 'owner' && (
          <>
            <PendingSection />
			
            <BlockedSection />
          </>
        )}
      </div>
    </div>
  );
};

export default Friends;