import React, { useContext, useEffect, useState } from 'react';
import '../../styles/profile.css';
import Image, { StaticImageData } from 'next/image';
import { SocketContext } from '@/contexts/SocketContext';
import defaultImage from '../../public/Avatar2.png';
import api from '@/utils/axios';

interface ProfilePictureProps {
  login: string;
  role: string;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ login, role }) => {
  const { socket } = useContext(SocketContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | StaticImageData>(defaultImage);

  useEffect(() => {
    if (login) {
      const getUserPic = () => {
        api
          .get(`/users/${login}/avatar`)
          .then(response => {
            var base64Image = response.data;
            setProfilePicture(base64Image);
          })
          .catch(error => {
            // console.log('Error is in getUserPic: ', error);
            setProfilePicture(defaultImage);
          });
      };

      getUserPic();

      if (socket) {
        // socket.on('error', (error: any) => {
        //   console.log('error: ', error);
        // });

        socket.emit('manageUserAvatarRoom', {
          userLogin: login,
          action: 'join',
        });

        socket.on('uploadedAvatar', (base64Image: string) => {
          setProfilePicture(base64Image);
        });
      }

      return () => {
        if (socket) {
          socket.off('uploadedAvatar');
          socket.emit('manageUserAvatarRoom', {
            userLogin: login,
            action: 'leave',
          });
        }
      }
    }
  }, [login, role, socket]);

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditing(false);
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileData = reader.result;

        if (socket) {
          socket.emit('uploadAvatar', {
            filename: file.name,
            data: fileData,
          });
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  }

  const handleCancel = () => {
    setIsEditing(false);
  }

  return (
    <div className="profile-container-picture">
      {isEditing ? (
        <div className="profile-edit-picture">
          <label htmlFor="profile-picture-upload"></label>
          <input id="profile-picture-upload" type="file" onChange={handleProfilePictureChange} />
          <button onClick={handleCancel}>Cancel</button>
        </div>
      ) : (
        <div className="profile-display-picture" onClick={role === 'owner' ? handleEdit : undefined}>
          <Image src={profilePicture} alt="Profile Picture" width={150} height={150} />
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
