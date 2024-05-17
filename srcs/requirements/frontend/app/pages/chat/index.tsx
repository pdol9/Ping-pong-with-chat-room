import React from 'react';
import '@/styles/profile.css';
import '@/app/globals.css';
import AuthLayout from '@/layouts/auth';
import ChatLayout from '@/layouts/chat';

const ChatPage: React.FC = () => {
  return (
    <AuthLayout>
      <ChatLayout>
      </ChatLayout>
    </AuthLayout>
  )
};

export default ChatPage;
