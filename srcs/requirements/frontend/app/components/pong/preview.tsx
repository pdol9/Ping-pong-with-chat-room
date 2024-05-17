import { useRouter } from "next/router";
import Loading from "../loading";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "@/contexts/SocketContext";
import Timer from "../timer";

interface GamePreviewProps {
  onGameStart: () => void;
}

const GamePreview: React.FC<GamePreviewProps> = ({ onGameStart }) => {
  const { socket } = useContext(SocketContext);
  const router = useRouter();
  const { homePlayer, foreignPlayer } = router.query;
  const [homePlayerValue, setHomePlayerValue] = useState<string | null>(null);
  const [foreignPlayerValue, setForeignPlayerValue] = useState<string | null>(null);

  useEffect(() => {
    if (socket) {
      // socket.on('error', (error: any) => {
      //   console.log('error: ', error);
      // });

      if (typeof homePlayer === 'string') {
        setHomePlayerValue(homePlayer);
      } else if (Array.isArray(homePlayer)) {
        setHomePlayerValue(homePlayer[0]);
      }
      if (typeof foreignPlayer === 'string') {
        setForeignPlayerValue(foreignPlayer);
      } else if (Array.isArray(foreignPlayer)) {
        setForeignPlayerValue(foreignPlayer[0]);
      }

      return (() => {
        // socket.off('error');
      })
    }
  }, [socket, homePlayer, homePlayerValue, foreignPlayer, foreignPlayerValue]);

  if (homePlayerValue && foreignPlayerValue) {
    return (
      <div style={{border: '5px solid black', marginLeft: '400px', marginRight: '400px', marginTop: '400px', width: '300px' }}>
        <h1 style={{ fontSize: '30px', color: 'pink'}}>Game is starting...</h1>
        <h2 style={{ fontSize: '30px', color: 'yellow'}}>{homePlayerValue} versus {foreignPlayerValue}</h2>
        <div style={{ fontSize: '20px', color: 'red ' }} >
		<Timer timeInS={3} onFinish={onGameStart}/>
		</div>
      </div>
    );
  }
  return (
    <Loading />
  );
};

export default GamePreview;
