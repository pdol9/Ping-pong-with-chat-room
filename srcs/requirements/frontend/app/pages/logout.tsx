import api from "@/utils/axios";
import { useRouter } from "next/router";
import '../styles/loading_and_logout.css';
import '../app/globals.css';
import { useContext, useEffect } from "react";
import { SocketContext } from "@/contexts/SocketContext";
import Image from "next/image";

const Logout = () => {
  const router = useRouter();
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    const logout: () => void = () => {
      api
        .post('/auth/logout')
        .then(() => {
          socket?.disconnect();
          router.push('/login');
        })
        .catch(error => {
          // console.log('Error in handlelogout:', error);
          socket?.disconnect();
          router.push('/login');
        });
    }

    logout();
  }, [socket, router]);

  return (
    <div className="logout" style={{ marginTop: '200px'}}>
		<div style={{ textAlign: 'center'}}>
      <h1 style={{ color: 'orange'}}><b>THANKS FOR PLAYING</b></h1>
	  </div>
		<div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
		  <Image src="/pingpong.png" alt="PingPongHandle" width={500} height={500} />
		  </div>
    </div>

  );
}

export default Logout;
