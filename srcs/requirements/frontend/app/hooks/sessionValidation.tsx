// import React, { useContext, useEffect, useState } from "react";
// import axios from "axios";
// import { AuthContext } from "@/contexts/AuthContext";

// const SessionValidation = () => {
//   const { validate, invalidate } = useContext(AuthContext);

  // useEffect(() => {
  //   const validateSession = () => {
  //     axios
  //       .get('/api/auth/validateSession')
  //       .then(response => {
  //         validate(response.data);
  //       })
  //       .catch(error => {
  //         console.log('no valid session', error);
  //         invalidate();
  //       })
  //   }
  //   validateSession();
  //   return (() => {
  //     invalidate();
  //   })
  // }, []);

//   return (
//     null
//   );
// };

// export default SessionValidation;

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';

import { AuthContext } from '@/contexts/AuthContext';
import api from '@/utils/axios';

// Custom hook for session validation
const useSessionValidation = () => {
  const router = useRouter();
  const { validate, invalidate } = useContext(AuthContext);

  useEffect(() => {
    const validateSession = () => {
      api
        .get('/auth/validateSession')
        .then(response => {
          validate(response.data);
        })
        .catch(error => {
          // console.log('no valid session', error);
          invalidate();
          router.push('/login');
        })
    }

    validateSession();
  }, []);
};

export default useSessionValidation;
