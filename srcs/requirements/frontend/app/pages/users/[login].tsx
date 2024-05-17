import React, { useContext, useEffect, useState } from 'react';
import '@/styles/profile.css';
import '@/app/globals.css';
import Friends from '@/components/profile/friends';
import ProfileDetails from '@/components/profile/profiledetails';
import { useRouter } from 'next/router';
import { AuthContext } from '@/contexts/AuthContext';
import Loading from '@/components/loading';
import Stats from '@/components/profile/stats';
import MatchHistory from '@/components/profile/matchhistory';
import api from '@/utils/axios';
import NotFoundError from '@/components/error/notFoundError';
import AuthLayout from '@/layouts/auth';

const Profile: React.FC = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const { login } = router.query;
  const [role, setRole] = useState<string | null>(null);
  const [loginValue, setLoginValue] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (login) {
      api
        .get(`/users/${login}/preview`)
        .then(response => {
          if (response.data.login !== login) {
            setIsError(true);
          } else {
            if (typeof login === 'string') {
              setLoginValue(login);
            } else if (Array.isArray(login)) {
              setLoginValue(login[0]);
            }
            setIsError(false);
          }
        })
        .catch(error => {
          // console.log('error preview: ', error);
          setIsError(true);
        })
    }
  }, [login]);

  useEffect(() => {
    if (user && loginValue) {
      if (user.login === loginValue) {
        setRole('owner');
      } else {
        setRole('user');
      }
    }
  }, [user, loginValue]);

  if (isError === true) {
    return (
      <AuthLayout>
        <NotFoundError />
      </AuthLayout>
    );
  } else if (loginValue && role) {
    return (
      <AuthLayout>
        <div className='Profile-full'>
          <div className='Profile-first-row'>
            <ProfileDetails login={loginValue} role={role} />
            <Stats login={loginValue} />
          </div>
        </div>
        <div className='profile-second-bigrow'>
          <Friends login={loginValue} role={role} />
          <MatchHistory login={loginValue} />
        </div>
      </AuthLayout>
    );
  } else {
    return (
      <AuthLayout>
        <Loading />
      </AuthLayout>
    );
  }
};

export default Profile;