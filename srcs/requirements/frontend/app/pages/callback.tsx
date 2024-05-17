import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useRouter } from 'next/router';
import '../app/globals.css';
import '../styles/login.css';
import { AuthContext } from '@/contexts/AuthContext';
import Loading from '../components/loading';
import api from '@/utils/axios';
import { User } from '@/components/userPreview';

const CallBackPage = () => {
  const { isAuthenticated, validate } = useContext(AuthContext);
  const router = useRouter();
  let inputcode = '';
  let [code_needed, setcode_needed] = useState(false);
  const authorizationCode = router.query.code as string;

/*
* runs the (input function) every render
*/
  useEffect(() => {
    if (isAuthenticated === true) {
      router.push('/');
    }
  }, [isAuthenticated, router])

  const sendAuthToBack_twofa = useCallback((authorizationCode: string | null, inputcode: string | null) => {
  
    api
      .post('/auth/mfa/login', {  mfa: inputcode })
      .then(response => {
        validate(response.data);
        // console.log('response from backend is:', response.data);
      })
      .catch(error => {
        // console.log('Error sendAuthToBack_twofa:', error);
      });
  }, [validate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    inputcode += (event.target.value);
    // console.log('input is: ', inputcode);
    if (inputcode.length === 6) {
      sendAuthToBack_twofa(authorizationCode, inputcode);
      inputcode = '';
    }
  };

/*
* runs the (input function) every render
*/
  useEffect(() => {
    const sendAuthToBack = (authorizationCode: string | null) => {
      api
        .post('/auth/42login', { code: authorizationCode })
        .then(response => {
          validate(response.data);
          // console.log('response from backend is:', response.data);
        })
        .catch(error => {
          // console.log('Error sendAuthToBack:', error);
          // console.log('its: ', error.message);
          if (error.message === 'Request failed with status code 403')
          {
            // console.log('babaman');
            setcode_needed(true);
          }
          else {
            router.push('/login');
          }
        });
    }

    if (router.isReady && !code_needed)
    {
      // console.log(router.isReady, !code_needed, authorizationCode)
      // console.log('Authorization Code:', authorizationCode);

      sendAuthToBack(authorizationCode);
    }

  }, [router, code_needed, authorizationCode]);

  if (code_needed) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1>YOU NEED 2FA CODE:</h1>
        <input type="text" 
          value={inputcode} 
          onChange={handleChange} 
          style={{ backgroundColor: 'green', color: 'red' }}  />
        </div>
    )
  }
  return (
    <Loading />
  );
}

export default CallBackPage;
