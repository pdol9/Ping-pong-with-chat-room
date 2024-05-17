import api from '@/utils/axios';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Channel } from './channelPreview';
import './channelUpdatePopup.css';



Modal.setAppElement('#__next');

interface ChannelUpdatePopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'public' | 'private' | 'protected',
  onUpdate: (type: 'public' | 'private' | 'protected', password: string | null) => void;
}

const ChannelUpdatePopup: React.FC<ChannelUpdatePopupProps> = ({
  isOpen,
  onClose,
  type,
  onUpdate,
}) => {
  const [Type, setType] = useState<'public' | 'private' | 'protected'>(type);
  const [password, setPassword] = useState<string | null>(null);
  const [isEmptyPassword, setIsEmptyPassword] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const handleUpdateChannel = () => {
    if (Type === 'protected' && (!password || password.trim() === '')) {
      setIsEmptyPassword(true);
      return;
    }

    onUpdate(Type, password);
    setType('public');
    setPassword(null);
    setIsEmptyPassword(false);
    handleClose();
  };

  return (
    <Modal
	  className='Modal'
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Popup"
    >
      <div className="channel-update-popup-content">
        <div className="channel-update-popup-body">
          <div className="channel-update-popup-type">
            <label>
              Public
              <input
                type="radio"
                value="public"
                checked={Type === 'public'}
                onChange={() => setType('public')}
              />
            </label>
            <label>
              Private
              <input
                type="radio"
                value="private"
                checked={Type === 'private'}
                onChange={() => setType('private')}
              />
            </label>
            <label>
              Protected
              <input
                type="radio"
                value="protected"
                checked={Type === 'protected'}
                onChange={() => setType('protected')}
              />
            </label>
          </div>
          {Type === 'protected' && (
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

		<div className="channel-update-popup-header">
          	<button className="update_button" onClick={handleUpdateChannel}>Update Channel</button>
        	<button className="exit_button" onClick={handleClose}>Exit</button>
		</div>

	    </div>
      </div>
    </Modal>
  );
};

export default ChannelUpdatePopup;
