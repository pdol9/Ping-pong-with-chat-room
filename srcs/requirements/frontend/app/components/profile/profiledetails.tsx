import { SocketContext } from '@/contexts/SocketContext';
import React, { useContext, useEffect, useState } from 'react';
import { User } from '../userPreview';
import ProfilePicture from './profilepic';
import MFAPopup from './twofapopup';
import api from '@/utils/axios';
import Router, { useRouter } from 'next/router';

interface UserUpdate {
  nickname: string;
  bio: string;
}

interface ProfileDetailsProps {
  login: string;
  role: string;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ login, role }) => {
  const { socket } = useContext(SocketContext);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [loginname, setLogin] = useState('');
  const [saveNickname, setSaveNickname] = useState('');
  const [bio, setBio] = useState('');
  const [saveBio, setSaveBio] = useState('');
  const [status, setStatus] = useState('offline');
  const [isFriend, setIsFriend] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
  const [QRcode, setQRcode] = useState<string>('');

  useEffect(() => {
    if (login) {
      const getUserData = () => {
        api
          .get(`/users/${login}/profile`)
          .then(response => {
            setFirstName(response.data.firstname);
            setLastName(response.data.lastname);
            setEmail(response.data.email);
            setNickname(response.data.nickname);
            setSaveNickname(response.data.nickname);
            setBio(response.data.bio);
            setSaveBio(response.data.bio);
            setStatus(response.data.status);
            setIsFriend(response.data.isFriend);
            setIsPending(response.data.isPending);
            setIsReceiving(response.data.isReceiving);
            setIsBlocked(response.data.isBlocked);
            setMfaEnabled(response.data.mfaEnabled);
			setLogin(response.data.login);
          })
          .catch(error => {
            // console.log('Error is: ', error);
          });
      };

      getUserData();

      if (socket) {
        // socket.on('error', (error: any) => {
        //   console.log('error: ', error);
        // });

        socket.emit('manageUserProfileRoom', {
          userLogin: login,
          action: 'join',
        });

        socket.on('userStatus', (user: User) => {
          setStatus(user.status);
        });
        socket.on('updatedProfile', (userUpdate: UserUpdate) => {
          setNickname(userUpdate.nickname);
          setSaveNickname(userUpdate.nickname);
          setBio(userUpdate.bio);
          setSaveBio(userUpdate.bio);
        });

        socket.on('blockedUserButton', (user: User) => {
          if (user.login === login) {
            setIsBlocked(true);
          }
        });

        socket.on('unblockedUserButton', (user: User) => {
          if (user.login === login) {
            setIsBlocked(false);
          }
        });

        socket.on('sentFriendRequestButton', (user: User) => {
          if (user.login === login) {
            setIsFriend(false);
            setIsPending(true);
            setIsReceiving(false);
          }
        });

        socket.on('receivedFriendRequestButton', (user: User) => {
          if (user.login === login) {
            setIsFriend(false);
            setIsPending(true);
            setIsReceiving(true);
          }
        });

        socket.on('newFriendButton', (user: User) => {
          if (user.login === login) {
            setIsFriend(true);
            setIsPending(false);
            setIsReceiving(false);
          }
        });

        socket.on('removedFriendButton', (user: User) => {
          if (user.login === login) {
            setIsFriend(false);
            setIsPending(false);
            setIsReceiving(false);
          }
        });
      }

      return () => {
        if (socket) {
          socket.off('updatedProfile');
          socket.off('userStatus');
          socket.off('blockedUserButton');
          socket.off('unblockedUserButton');
          socket.off('sentFriendRequestButton');
          socket.off('receivedFriendRequestButton');
          socket.off('newFriendButton');
          socket.off('removedFriendButton');
          socket.emit('manageUserProfileRoom', {
            userLogin: login,
            action: 'leave',
          });
        }
      }
    }
  }, [login, role, socket]);

  const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(event.target.value);
  };

  const handleBioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBio(event.target.value);
  };

  const handleEdit = () => {
    if (isEditing) {
      setNickname(saveNickname);
      setBio(saveBio);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setIsEditing(false);
    let error = false;
    const regex = /^[A-Za-z0-9_]+$/;
    if (nickname.length > 15 || !regex.test(nickname)) {
      error = true;
    }
    if (bio.length > 50) {
      error = true;
    }
    setNickname(saveNickname);
    setBio(saveBio);
    if (socket && !error) {
      socket.emit('updateProfile', {
        nickname: nickname,
        bio: bio,
      })
    }
  };

  const disableMFA = () => {
    api
      .post('/auth/mfa/disable')
      .then(() => {
        setMfaEnabled(false);
        setQRcode('');
      })
      .catch(error => {
        // console.log('2fa error is: ', error);
      })
  }

  const openMFAPopup = () => {
    api
      .post('/auth/mfa/enable')
      .then(response => {
        var QRcode = response.data;
        setQRcode(QRcode);
        setIsOpen(true);
      })
      .catch(error => {
        // console.log('2fa error is: ', error);
      });
  }

  const closeMFAPopup = () => {
    setIsOpen(false);
  }

  const handleBlock = () => {
    if (socket) {
      socket.emit('blockUser', {
        login: login,
      })
    }
  }

  const handleUnblock = () => {
    if (socket) {
      socket.emit('unblockUser', {
        login: login,
      })
    }
  }

  const handleAddFriend = () => {
    if (socket) {
      socket.emit('addFriend', {
        login: login,
      })
    }
  }

  const handleRemoveFriend = () => {
    if (socket) {
      socket.emit('removeFriend', {
        login: login,
      })
    }
  }

  const handleConfirmFriend = () => {
    if (socket) {
      socket.emit('confirmFriend', {
        login: login,
      })
    }
  }

  const handleSendMessage = () => {
    if (socket) {
      socket.emit('showDirect', {
        login: login,
      })
      router.push(`/chat/direct/${login}`);
    }
  }

  return (
    <div>
      <div className="Profile-user-stats-card">
        <ProfilePicture
          login={login}
          role={role}
        />
        <div className="profile-container-details">
          <table>
            <tbody>
				<tr>
                <td>Login:</td>
                <td>{loginname}</td>
              </tr>
              <tr>
                <td>Nickname:</td>
                <td>{isEditing ? <input placeholder={'What\'s your Nickname?'} type="text" value={nickname} onChange={handleNicknameChange} /> : nickname}</td>
              </tr>
              <tr>
                <td>First Name:</td>
                <td>{firstname}</td>
              </tr>
              <tr>
                <td>Last Name:</td>
                <td>{lastname}</td>
              </tr>
              <tr>
                <td>Email:</td>
                <td>{email}</td>
              </tr>
              <tr>
                <td>Bio:</td>
                <td>{isEditing ? <input placeholder={'Tell us about you...'} type="text" value={bio} onChange={handleBioChange} /> : bio}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {role === 'owner' && (
          <div className="profile_editbutton">
            <button onClick={handleEdit}>{isEditing ? 'Cancel' : 'Edit'}</button>
            <div >
              {mfaEnabled ? (
                <button onClick={disableMFA}>disable 2FA</button>
              ) : (
                <div>
                  <button onClick={openMFAPopup}>enable 2FA</button>
                  <MFAPopup
                    isOpen={isOpen}
                    onClose={closeMFAPopup}
                    onMFAEnable={() => setMfaEnabled(true)}
                    QRcode={QRcode}
                  />
                </div>
              )}
        
			</div>
            {isEditing && (
              <div >
                <button onClick={handleSave}>Save</button>
              </div>
            )}
          </div>
        )}
        {role === 'user' && (
          <div className="profile_editbutton">
            {isBlocked ? (
              <button onClick={handleUnblock}>unblock</button>
            ) : (
              <button onClick={handleBlock}>block</button>
            )}
            {isFriend && (
              <div>
                <button onClick={handleRemoveFriend}>remove</button>
              </div>
            )}
            {isPending && isReceiving && (
              <div className="profile_save_button">
                <button onClick={handleConfirmFriend}>confirm</button>
                <button onClick={handleRemoveFriend}>decline</button>
              </div>
            )}
            {isPending && !isReceiving && (
              <div>
                <button onClick={handleRemoveFriend}>cancel</button>
              </div>
            )}
            {!isFriend && !isPending && (
              <div>
                <button onClick={handleAddFriend}>add</button>
              </div>
            )}
            <button onClick={handleSendMessage}>DM</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDetails;
