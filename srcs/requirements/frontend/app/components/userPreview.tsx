import { SocketContext } from "@/contexts/SocketContext";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import Loading from "./loading";

export interface User {
  login: string;
  nickname: string;
  status: string;
}

interface UserPreviewProps {
  user: User | null;
}

const UserPreview: React.FC<UserPreviewProps> = ({ user }) => {
  const { socket } = useContext(SocketContext);
  const router = useRouter();
  const [login, setLogin] = useState<string>('');
  const [nickname, setNickname] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('offline');

  useEffect(() => {
    if (socket && user) {
      socket.emit('manageUserPreviewRoom', {
        userLogin: user.login,
        action: 'join',
      });
      setLogin(user.login);
      setNickname(user.nickname);
      setStatus(user.status);

      socket.on('userStatus', (usr: User) => {
        if (user.login === usr.login) {
          setStatus(usr.status);
        }
      })
    }

    return () => {
      if (socket && user) {
        socket.off('userStatus');
        socket.emit('manageUserPreviewRoom', {
          userLogin: user.login,
          action: 'leave',
        });
      }
    }
  }, [user, socket]);

  const handleProfileClick = () => {
    if (login) {
      router.push(`/users/${login}`);
    }
  };

  if (login && status) {
    return (
      <div>
        <button onClick={handleProfileClick}>
          <div>
            {!nickname ? (
              <h2><b>User:</b> {login}</h2>
            ) : (
              <h2><b>User:</b> {nickname}</h2>
            )}
          </div>
          <p><b>Status:</b> {status}</p>
        </button>
      </div>
    );
  } else {
    return (
      null
    );
  }
}

export default UserPreview;
