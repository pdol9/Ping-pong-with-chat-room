import React, { useState } from 'react';
import Modal from 'react-modal';
import './passwordPrompt.css';


interface PasswordPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
}

const PasswordPrompt: React.FC<PasswordPromptProps> = ({ isOpen, onClose, onSubmit }) => {
  const [password, setPassword] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(password);
    setPassword('');
    onClose();
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  return (
    <Modal
	  className="Modal"
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Password Prompt"
    >
      <h2>Enter Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={handleInputChange}
          placeholder="Password"
        />
        <button className="submit_button" type="submit">Submit</button>
        <button className="cancel_button" type="button" onClick={handleClose}>Cancel</button>
      </form>
    </Modal>
  );
};

export default PasswordPrompt;
