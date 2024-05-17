import { SocketContext } from "@/contexts/SocketContext";
import { useContext, useEffect, useState } from "react";
import UserPreview, { User } from "../userPreview";
import Loading from "../loading";

interface GameResultBody {
  id: string;
  homePlayer: User;
  foreignPlayer: User;
  homeScore: number;
  foreignScore: number;
  created_at: string;
}

interface GameResultsProps {
  onCloseResults: () => void;
}

const GameResults: React.FC<GameResultsProps> = ({ onCloseResults }) => {
  const { socket } = useContext(SocketContext);
  const [hasResults, setHasResults] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [homePlayer, setHomePlayer] = useState<User | null>(null);
  const [foreignPlayer, setForeignPlayer] = useState<User | null>(null);
  const [homeScore, setHomeScore] = useState<number | null>(null);
  const [foreignScore, setForeignScore] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    if (socket) {
      // socket.on('error', (error: any) => {
      //   console.log('error: ', error);
      // });

      socket.on('gameResults', (gameResults: GameResultBody) => {
        setHasResults(true);
        setId(gameResults.id);
        setHomePlayer(gameResults.homePlayer);
        setForeignPlayer(gameResults.foreignPlayer);
        setHomeScore(gameResults.homeScore);
        setForeignScore(gameResults.foreignScore);
        setDate(gameResults.created_at);
      });

      return () => {
        socket.off('gameResults');
        // socket.off('error');
      }
    }
  }, [socket]);

  const handleClose = () => {
    onCloseResults();
  }

  if (hasResults) {
    return (
      <div style={{border: '5px solid black', marginLeft: '400px', marginRight: '400px', marginTop: '400px', width: '300px' }}>
        <div >
          <h1 style={{ fontSize: '30px', color: 'pink'}}>Game Results</h1>
          <h3 style={{ color: 'red'}}><b>id: {id}</b></h3>
          <UserPreview user={homePlayer} />
          <UserPreview user={foreignPlayer} />
          <h3 style={{ color: 'red'}}><b>score:</b> {homeScore} : {foreignScore}</h3>
          <h3 style={{ color: 'green'}}><b>date:</b> {date}</h3>
        </div>
		<div>
		<button style={{ color: 'white' }} onClick={handleClose}>Close Results</button>
		</div>
      </div>

    );
  }
  return (
    <Loading />
  );
}

export default GameResults;
