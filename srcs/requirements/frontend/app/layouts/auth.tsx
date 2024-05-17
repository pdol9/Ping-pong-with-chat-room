import React, { ReactNode, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '@/contexts/AuthContext';
import Sidebar from '@/components/sidebar';
import Loading from '@/components/loading';
import useSessionValidation from '@/hooks/sessionValidation';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  useSessionValidation();

  const { isAuthenticated, user } = useContext(AuthContext);
  const router = useRouter();

  if (isAuthenticated === true && user) {
    return (
      <>
        <Sidebar />
        {children}
      </>
    );
  } else if (isAuthenticated === true) {
    return (
      <>
        <Sidebar />
        <Loading />
      </>
    );
  } else if (isAuthenticated === false) {
    router.push('/login');
  }
  return (
    <Loading />
  );
};

export default AuthLayout;
