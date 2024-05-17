import { DefaultEventsMap } from '@socket.io/component-emitter';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Socket, io } from "socket.io-client";
import { AuthContext } from './AuthContext';

interface SocketContextValue {
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
}

const SocketContext = createContext<SocketContextValue>({ socket: null });

const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

  useEffect(() => {
    let newSocket: Socket<DefaultEventsMap, DefaultEventsMap>;

    if (isAuthenticated) {
      newSocket = io();
      setSocket(newSocket);
    } else if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    }
  }, [isAuthenticated]);

  const contextValue: SocketContextValue = {
    socket,
  };

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
};

export { SocketContext, SocketProvider };
