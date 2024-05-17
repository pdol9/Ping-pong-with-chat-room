import api from '@/utils/axios';
import React, { useState } from 'react';
import Modal from 'react-modal';
import { Channel } from './channelPreview';
import './channelCreatePopup.css';
Modal.setAppElement('#__next');

interface ChannelCreatePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (channel: Channel) => void;
}

const ChannelCreatePopup: React.FC<ChannelCreatePopupProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'public' | 'private' | 'protected'>('public');
  const [password, setPassword] = useState<string | null>(null);
  const [isEmptyName, setIsEmptyName] = useState(false);
  const [isEmptyPassword, setIsEmptyPassword] = useState(false);
  const [isTakenName, setisTakenName] = useState(false);
  const handleClose = () => {
    onClose();
  };

  const handleCreateChannel = () => {
    if (name.trim() === '') {
      setIsEmptyName(true);
      return;
    }

    if (type === 'protected' && (!password || password.trim() === '')) {
      setIsEmptyPassword(true);
      return;
    }

    api
      .post('/chat/channel/create', {
        name: name,
        type: type,
        password: password,
      })
      .then(response => {
        onCreate(response.data);
        handleClose();
      })
      .catch(error => {
        // console.log('error creating channel: ', error);
        if (error.response.data.message === 'channel already existing') {
          setisTakenName(true);
        }
        setName('');
        setType('public');
        setPassword(null);
        setIsEmptyName(false);
        setIsEmptyPassword(false);
      })
  };

  return (
    <Modal
	  className='Modal'
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Popup"
    >
      <div className="channel-create-popup-content">
        <div className="channel-create-popup-body">
          <label>
            New Channel:
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            {isEmptyName && (
              <p>provide a name</p>
            )}
          </label>

		  <div/>

        <div className="channel-create-popup-type">
            <label>
              Public
              <input
                type="radio"
                value="public"
                checked={type === 'public'}
                onChange={() => setType('public')}
              />
            </label>
            <label>
              Private	 
              <input
                type="radio"
                value="private"
                checked={type === 'private'}
                onChange={() => setType('private')}
              />
            </label>
            <label>
              Protected 
              <input
                type="radio"
                value="protected"
                checked={type === 'protected'}
                onChange={() => setType('protected')}
              />
            </label>
        </div>
          {type === 'protected' && (
            <label>
              Password:
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
              {isEmptyPassword && (
                <p>provide a password</p>
              )}
            </label>
          )}
          {isTakenName && (
            <p>channel name has to be unique</p>
          )}
		 <div className="channel-create-popup-header">

          <button className='create_button' onClick={handleCreateChannel}>Create Channel</button>
		  <button className='exit_buttton' onClick={handleClose}>Exit</button>
		</div> 
		</div>

        {/* <div className="channel-create-popup-header">
          <button onClick={handleClose}>Exit</button>
        </div> */}
      </div>
    </Modal>
  );
};

export default ChannelCreatePopup;
