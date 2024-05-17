import { useContext, useEffect, useState } from "react";
import UserPreview, { User } from "../userPreview";
import { SocketContext } from "@/contexts/SocketContext";
import '../../styles/queue.css';

export interface Matched {
  id: string;
  homePlayer: User;
  foreignPlayer: User;
}

interface GameQueueProps {
  onLeaveQueue: () => void;
  onQueuePop: (matched: Matched) => void;
}

const GameQueue: React.FC<GameQueueProps> = ({ onLeaveQueue, onQueuePop }) => {
  const { socket } = useContext(SocketContext);
  const [isPopped, setIsPopped] = useState(false);

  useEffect(() => {
    if (socket) {
      // socket.on('error', (error: any) => {
      //   console.log('error: ', error);
      // });

      const handleMatched = (matched: Matched) => {
        setIsPopped(true);
        onQueuePop(matched);
      };

      socket.on("matched", handleMatched);

      return () => {
        socket.off("matched", handleMatched);
        // socket.off('error');
        if (!isPopped) {
          onLeaveQueue();
        }
      };
    }
  }, [socket, onQueuePop, isPopped, onLeaveQueue]);

  return (
    <div style={{border: '5px solid black', marginLeft: '400px', marginRight: '400px', marginTop: '400px', width: '300px' }}>
      <h1 style={{ fontSize: '30px', color: 'pink'}} >Waiting In Queue...</h1>
      <button onClick={onLeaveQueue} style={{color: 'orange', fontSize: '25', border: '2px solid white', marginTop: '20px', marginBottom: '20px'}}>Leave Queue</button>
    </div>
  );
};

export default GameQueue;
