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
import ChannelDetails from '@/components/chat/channelDetails';
import { AuthContext } from '@/contexts/AuthContext';

const ChannelPage: React.FC = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { name } = router.query;
  const [nameValue, setNameValue] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (name) {
      const getChannelPreview = () => {
        api
          .get(`/chat/channel/${name}/preview`)
          .then(response => {
            if (response.data.name !== name) {
              setIsError(true);
            } else {
              if (typeof name === 'string') {
                setNameValue(name);
              } else if (Array.isArray(name)) {
                setNameValue(name[0]);
              }
              setChatId(response.data.chat);
              setIsError(false);
            }
          })
          .catch(error => {
            // console.log('error preview: ', error);
            setIsError(true);
          })
      }

      getChannelPreview();
    }
  }, [name]);

  if (isError === true) {
    return (
      <AuthLayout>
        <ChatLayout>
          <NotFoundError />
        </ChatLayout>
      </AuthLayout>
    );
  } else if (user && nameValue && chatId) {
    return (
      <AuthLayout>
        <ChatLayout>
          <Conversation id={chatId} />
          <ChannelDetails login={user.login} name={nameValue} />
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

export default ChannelPage;
