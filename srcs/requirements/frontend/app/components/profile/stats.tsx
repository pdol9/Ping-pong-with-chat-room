import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "@/contexts/SocketContext";
import api from "@/utils/axios";
import '../../styles/profile.css';

interface StatsProps {
	login: string;
  }
  
  const Stats: React.FC<StatsProps> = ({ login }) => {
	const { socket } = useContext(SocketContext);
	const [rank, setRank] = useState(0);
	const [xp, setXP] = useState(0);
	const [wins, setWins] = useState(0);
	const [losses, setLosses] = useState(0);
  
	useEffect(() => {
	  if (login) {
		const getUserStats = () => {
		  api
			.get(`/users/${login}/stats`)
			.then(response => {
			  setRank(response.data.rank);
			  setXP(response.data.xp);
			  setWins(response.data.wins);
			  setLosses(response.data.losses);
			})
			.catch(error => {
			  // console.log('error stats: ', error);
			});
		};
  
		getUserStats();
  
		if (socket) {
		  // socket.on('error', (error: any) => {
			// console.log('error: ', error);
		  // });
  
		  socket.emit('manageUserStatsRoom', {
			userLogin: login,
			action: 'join',
		  });
  
		  socket.on('updatedStats', stats => {
			setRank(stats.rank);
			setXP(stats.xp);
			setWins(stats.wins);
			setLosses(stats.losses);
		  });
		}
  
		return () => {
		  if (socket) {
			socket.off('updatedStats');
			socket.emit('manageUserStatsRoom', {
			  userLogin: login,
			  action: 'leave',
			});
		  }
		}
	  }
	}, [login, socket]);
  //<h1 style={{ color: 'purple', fontSize: '30px', marginLeft: '150px',  whiteSpace: 'nowrap'}}><b>Game Statistics</b></h1>  return (
   return (  
	 <div className="profile-game-stats" >
		  
		  <div style={{ marginTop: '150px'}}>
		<p style={{ color: 'red' }}>Rank: {rank}</p>
			</div>
			<div style={{ marginTop: '150px'}}>
		<p style={{ color: 'green', marginLeft: '100px' }}>XP: {xp}</p>
			</div>
			<div style={{ marginTop: '150px'}}>
		<p style={{ color: 'yellow', marginLeft: '200px' }}>Wins: {wins}</p>
			</div>
		<div style={{ marginLeft: '200px', marginTop: '150px'}}>
		<p style={{ color: 'orange' }}>Losses: {losses}</p>
			</div>
	  </div>
	);
  };
  
  export default Stats;


// interface StatsProps {
//   login: string;
// }

// const Stats: React.FC<StatsProps> = ({ login }) => {
//   const { socket } = useContext(SocketContext);
//   const [rank, setRank] = useState(0);
//   const [xp, setXP] = useState(0);
//   const [wins, setWins] = useState(0);
//   const [losses, setLosses] = useState(0);

//   useEffect(() => {
//     if (login) {
//       const getUserStats = () => {
//         api
//           .get(`/users/${login}/stats`)
//           .then(response => {
//             setRank(response.data.rank);
//             setXP(response.data.xp);
//             setWins(response.data.wins);
//             setLosses(response.data.losses);
//           })
//           .catch(error => {
//             console.log('error stats: ', error);
//           });
//       };

//       getUserStats();

//       if (socket) {
//         socket.on('error', (error: any) => {
//           console.log('error: ', error);
//         });

//         socket.emit('manageUserStatsRoom', {
//           userLogin: login,
//           action: 'join',
//         });

//         socket.on('updatedStats', stats => {
//           setRank(stats.rank);
//           setXP(stats.xp);
//           setWins(stats.wins);
//           setLosses(stats.losses);
//         });
//       }

//       return () => {
//         if (socket) {
//           socket.off('updatedStats');
//           socket.emit('manageUserStatsRoom', {
//             userLogin: login,
//             action: 'leave',
//           });
//         }
//       }
//     }
//   }, [login]);
// //<h1 style={{ color: 'purple', fontSize: '30px', marginLeft: '150px',  whiteSpace: 'nowrap'}}><b>Game Statistics</b></h1>  return (
//  return (  
//    <div className="profile-game-stats" >
// 		<div>
// 		<h1 style={{ color: 'purple', marginLeft:'150px' }}>Gaming Statistics</h1>
// 		</div>

// 		<div style={{ marginTop: '150px'}}>
// 		<span style={{ color: 'red' }}> Rank: {rank}</span>
// 		<span style={{ marginLeft: '50px' }}>XP: {xp}</span>
// 		<span style={{ marginLeft: '50px', color: 'yellow' }}>Wins: {wins}</span>
// 		<span style={{ marginLeft: '50px', color: 'orange' }}>Losses: {losses}</span>
// 		</div>
		
		

      
	 	 
		
// 		</div>
//   );
// };

// export default Stats;
