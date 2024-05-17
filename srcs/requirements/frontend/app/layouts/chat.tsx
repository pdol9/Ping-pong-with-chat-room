import React, { ReactNode, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import Loading from '@/components/loading';
import UserChannels from '@/components/chat/userChannels';
import Conversation from '@/components/chat/conversation';
import './chat.css';


interface ChatLayoutProps {
  children: ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (user) {
    return (
		<div className='chat_layout'>
      <>
        <UserChannels login={user.login} />
        {children}
      </>
	  </div>

    );
  } else {
    return (
      <Loading />
    );
  }
};

export default ChatLayout;
