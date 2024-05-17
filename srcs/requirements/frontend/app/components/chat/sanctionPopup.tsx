import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { User } from '../userPreview';
import './sanctionPopup.css';

Modal.setAppElement('#__next');

interface SanctionPopupProps {
  user: User | undefined;
  onClose: () => void;
  onSubmit: (user: User, type: 'kick' | 'ban' | 'mute', date: string | null) => void;
}

const SanctionPopup: React.FC<SanctionPopupProps> = ({
  user,
  onClose,
  onSubmit,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [type, setType] = useState<'kick' | 'ban' | 'mute'>('kick');
  const [date, setDate] = useState<string | null>(null);
  const [isEmptyDate, setIsEmptyDate] = useState(false);

  useEffect(() => {
    if (user) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [user]);

  const handleClose = () => {
    onClose();
  };

  const handleSanction = () => {
    if (user) {
      if ((type === 'ban' || type === 'mute') && !date) {
        setIsEmptyDate(true);
        return;
      }

      setIsEmptyDate(false);
      onSubmit(user, type, date);
      onClose();
    }
  };

  return (
    <Modal
	className="Modal"
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Popup"
    >
      <div className="sanction-popup-content">


        <div className="sanction-popup-body">
          	<div className="sanction-popup-type">
            <label>
              Kick
              <input
                type="radio"
                value="kick"
                checked={type === 'kick'}
                onChange={() => setType('kick')}
              />
            </label>
            <label>
              Ban
              <input
                type="radio"
                value="ban"
                checked={type === 'ban'}
                onChange={() => setType('ban')}
              />
            </label>
            <label>
              Mute
              <input
                type="radio"
                value="mute"
                checked={type === 'mute'}
                onChange={() => setType('mute')}
              />
            </label>
         	</div>
          {(type === 'ban' || type === 'mute') && (
            <label>
              Timeout:
              <input
                type="datetime-local"
                onChange={(e) => setDate(e.target.value)}
              />
              {isEmptyDate && (
                <p>provide a date</p>
              )}
            </label>
          )}
		</div>

        <div className="sanction-popup-header">
			<button className="sanction_button" onClick={handleSanction}>Sanction</button>
			<button className="exit_button" onClick={handleClose}>Exit</button>
        </div>

      </div>
    </Modal>
  );
};

export default SanctionPopup;
