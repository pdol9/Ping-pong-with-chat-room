import { User } from "../userPreview";
import { SocketContext } from "@/contexts/SocketContext";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import './directPreview.css';


export interface Direct extends User {
  chat: string;
}

interface DirectPreviewProps {
  direct: Direct | null;
  onHide: () => void;
}

const DirectPreview: React.FC<DirectPreviewProps> = ({ direct, onHide }) => {
  const { socket } = useContext(SocketContext);
  const router = useRouter();
  const [login, setLogin] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [status, setStatus] = useState<string>('public');
  const [chat, setChat] = useState<string>('');

  useEffect(() => {
    const handleHidePreview = (dir: Direct) => {
      if (login === dir.login) {
        onHide();
      }
    };

    if (socket && direct) {
      // socket.on('error', (error: any) => {
      //   console.log('error: ', error);
      // });

      socket.emit('manageUserPreviewRoom', {
        userLogin: direct.login,
        action: 'join',
      });
      setLogin(direct.login);
      setNickname(direct.nickname);
      setStatus(direct.status);
      setChat(direct.chat);

      socket.on('userStatus', (user: User) => {
        if (direct.login === user.login) {
          setStatus(user.status);
        }
      })

      socket.on('hiddenDirect', handleHidePreview);
    }

    return () => {
      if (socket && direct) {
        socket.off('userStatus');
        socket.off('hiddenDirect', handleHidePreview);
        socket.emit('manageUserPreviewRoom', {
          userLogin: direct.login,
          action: 'leave',
        });
      }
    }
  }, [socket, direct, login, onHide]);

  const handleDirectClick = () => {
    // console.log(login)
    if (login) {
      router.push(`/chat/direct/${login}`);
    }
  };

  if (login) {
    return (
      <button className='direct' onClick={handleDirectClick}>
          <div>
            {!nickname ? (
              <text>{login}</text>
            ) : (
              <text>{nickname}</text>
            )}
          </div>
          <text>{status}</text>
      </button>
    );
  }
  return null;
}

export default DirectPreview;
