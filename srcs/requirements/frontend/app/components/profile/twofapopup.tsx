import React, { useState } from 'react';
import Image from 'next/image';
import Modal from 'react-modal';
import api from '@/utils/axios';

Modal.setAppElement('#__next');

interface twofamodalprops {
  isOpen: boolean;
  onClose: () => void;
  onMFAEnable: () => void;
  QRcode: string;
}

const MFAPopup: React.FC<twofamodalprops> = ({
  isOpen,
  onClose,
  onMFAEnable,
  QRcode,
}) => {
  const [isError, setIsError] = useState(false);
  let inputValue: string = '';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    inputValue += (event.target.value);
    // console.log('input is: ', inputValue);
    if (inputValue.length === 6) {
      // console.log('length of 6 reached');
      // console.log('string being sent: ', inputValue);
      verifyMFA(inputValue);
      inputValue = '';
    }
  };

  const verifyMFA = (input: string) => {
    api
      .post('/auth/mfa/verify', {mfa: input})
      .then(() => {
        // console.log('mfa enabled - you are secure');
        onMFAEnable();
        onClose();
      })
      .catch(error => {
        // console.log('error 2fa: ', error);
        setIsError(true);
      });
  }

    const handleClose = () => {
      setIsError(false);
      onClose();
    }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel='Popup'
    >
      <div >
        <h1>Scan the code</h1>
        <div className="twofacode" style={{  }} >
          <Image src={QRcode} alt="twofacode" width={300} height={300} />
        </div>
        <div className="input-field">
            <input style={{ border: '1px solid black', color: 'blue' }} type="text" value={inputValue} onChange={handleChange} />
        </div>
        {isError && (
          <h3>wrong code</h3>
        )}
        <div>
          <button onClick={handleClose}>exit</button>
        </div>
      </div>
    </Modal>
  );
}

export default MFAPopup;
