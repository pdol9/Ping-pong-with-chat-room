import React, { useContext, useEffect, useState } from 'react';
import '@/styles/profile.css';
import '@/app/globals.css';
import { useRouter } from 'next/router';
import Loading from '@/components/loading';
import api from '@/utils/axios';
import NotFoundError from '@/components/error/notFoundError';
import AuthLayout from '@/layouts/auth';
import ChatLayout from '@/layouts/chat';
import Conversation from '@/components/chat/conversation';
import DirectDetails from '@/components/chat/directDetails';
import { AuthContext } from '@/contexts/AuthContext';

const DirectPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const { login } = router.query;
  const [loginValue, setLoginValue] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (login) {
      const getDirectPreview = () => {
        api
          .get(`/chat/${login}/preview`)
          .then(response => {
            if (response.data.login !== login) {
              setIsError(true);
            } else {
              if (typeof login === 'string') {
                setLoginValue(login);
              } else if (Array.isArray(login)) {
                setLoginValue(login[0]);
              }
              setChatId(response.data.chat);
            }
            setIsError(false);
          })
          .catch(error => {
            // console.log('error preview: ', error);
            setIsError(true);
          })
      }

      getDirectPreview();
    }
  }, [login]);

  if (isError === true) {
    return (
      <AuthLayout>
        <ChatLayout>
          <NotFoundError />
        </ChatLayout>
      </AuthLayout>
    );
  } else if (user && loginValue && chatId) {
    return (
      <AuthLayout>
        <ChatLayout>
          <Conversation id={chatId} />
          <DirectDetails self={user.login} login={loginValue} />
        </ChatLayout>
      </AuthLayout>
    );
  } else {
    return (
      <AuthLayout>
        <ChatLayout>
          <Loading />
        </ChatLayout>
      </AuthLayout>
    );
  }
};

export default DirectPage;
