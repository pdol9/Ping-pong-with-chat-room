import React, { useContext } from 'react';
import Link from 'next/link';
import '../styles/sidebar.css';
import { useRouter } from 'next/router';
import { AuthContext } from '@/contexts/AuthContext';
import Image from 'next/image';

const Sidebar: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useContext(AuthContext);

  const handleIsLogout: () => void = () => {
    router.push('/logout');
  };

  if (isAuthenticated === true && user) {
    return (
      <>
        <nav className="Sidebar">
          <div className="SidebarLogo">
            <Link href="/">
              <button style={{ margin: '10px' }}>
                <Image src="/LogoPongChat2.png" alt="Home" width={55} height={55} />
              </button>
            </Link>
          </div>
          <div className="Sidebar_top">
            {/* Top buttons */}
            <div className="SidebarButton">
              <Link href={`/users/${user.login}`}>
                <button style={{ margin: '10px' }}>
                  <Image src="/Avatar2.png" alt="Profile" width={40} height={40} />
                </button>
              </Link>
              <Link href="/game">
                <button style={{ margin: '10px' }}>
                  <Image src="/Game.png" alt="Play" width={40} height={40} />
                </button>
              </Link>
              <Link href="/chat">
                <button style={{ margin: '10px' }}>
                  <Image src="/Chat2.png " alt="Button 3" width={40} height={40} />
                </button>
              </Link>
            </div>
          </div>
          <div className="Sidebar_bottom">
            {/* Bottom buttons */}
            <div className="SidebarButton">
        
          <div>
                <button onClick={handleIsLogout} style={{ margin: '10px' }}>
                  <Image src="/LogOut.png" alt="Button 2" width={40} height={40} />
                </button>
          </div>
        
            </div>
          </div>
        </nav>
      </>
    );
  }
  return null;
};

export default Sidebar;


