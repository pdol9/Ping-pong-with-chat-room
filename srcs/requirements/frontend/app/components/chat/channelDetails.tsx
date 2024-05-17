import { SocketContext } from "@/contexts/SocketContext";
import api from "@/utils/axios";
import { useContext, useEffect, useState } from "react";
import UserPreview, { User } from "../userPreview";
import { Channel } from "./channelPreview";
import { useRouter } from "next/router";
import SanctionPopup from "./sanctionPopup";
import { Button, Form } from "react-bootstrap";
import ChannelUpdatePopup from "./channelUpdatePopup";
import Loading from "../loading";
import ForbiddenError from "../error/forbidden";
import './channelDetails.css';




interface ChannelDetailsProps {
  login: string;
  name: string;
}

const ChannelDetails: React.FC<ChannelDetailsProps> = ({ login, name }) => {
  const { socket } = useContext(SocketContext);
  const router = useRouter();
  const [isDeleted, setIsDeleted] = useState(false);
  const [type, setType] = useState<'public' | 'private' | 'protected'>('public');
  const [role, setRole] = useState<'owner' | 'admin' | 'user'>('user');
  const [owner, setOwner] = useState<User | null>(null);
  const [admins, setAdmins] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [muted, setMuted] = useState<User[]>([]);
  const [banned, setBanned] = useState<User[]>([]);
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [deletedAt, setDeletedAt] = useState<Date | null>(null);
  const [searchUserLogin, setSearchUserLogin] = useState('');
  const [isNotFound, setIsNotFound] = useState(false);
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [sanctionUser, setSanctionUser] = useState<User | undefined>(undefined);
  const [channelUpdateIsOpen, setChannelUpdateIsOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isResponse, setIsResponse] = useState(false);

  useEffect(() => {
    if (login && name) {
      const getChannelDetails = () => {
        api
          .get(`/chat/channel/${name}/details`)
          .then(response => {
            setIsResponse(true);
            setType(response.data.type);
            setRole(response.data.role);
            setOwner(response.data.owner);
            setAdmins(response.data.admins);
            setUsers(response.data.users);
            setMuted(response.data.muted);
            setBanned(response.data.banned);
            setCreatedAt(response.data.created_at);
            setUpdatedAt(response.data.updated_at);
            setDeletedAt(response.data.deleted_at);
            setIsError(false);
          })
          .catch(error => {
            setIsResponse(false);
            // console.log('error channel details: ', error);
            if (error.response.data.message === 'not a channel user') {
              setIsError(true);
            }
          })
      }

      getChannelDetails();

      if (socket) {
        // socket.on('error', (error: any) => {
        //   console.log('error: ', error);
        // });

        socket.emit('manageChannelDetailsRoom', {
          channelName: name,
          action: 'join',
        });

        socket.on('updatedChannel', (channel: Channel) => {
          if (name === channel.name) {
            setType(channel.type);
          }
        });

        socket.on('deletedChannel', (channel: Channel) => {
          if (name === channel.name) {
            setIsDeleted(true);
          }
        });

        socket.on('newUser', (user: User) => {
          setUsers((prevUsers) => prevUsers?.filter((prevUser) => prevUser.login !== user.login));
          setUsers((prevUsers) => [...prevUsers, user]);
        });

        socket.on('removedUser', (user: User) => {
          setUsers((prevUsers) => prevUsers?.filter((prevUser) => prevUser.login !== user.login));
          setAdmins((prevAdmins) => prevAdmins?.filter((prevAdmin) => prevAdmin.login !== user.login));
        });

        socket.on('mutedUser', (user: User) => {
          setMuted((prevMuted) => prevMuted?.filter((prevMute) => prevMute.login !== user.login));
          setMuted((prevMuted) => [...prevMuted, user]);
        });

        socket.on('bannedUser', (user: User) => {
          setUsers((prevUsers) => prevUsers?.filter((prevUser) => prevUser.login !== user.login));
          setAdmins((prevAdmins) => prevAdmins?.filter((prevAdmin) => prevAdmin.login !== user.login));
          setBanned((prevBanned) => prevBanned?.filter((prevBan) => prevBan.login !== user.login));
          setBanned((prevBanned) => [...prevBanned, user]);
        });

        socket.on('promotedUser', (user: User) => {
          setUsers((prevUsers) => prevUsers?.filter((prevUser) => prevUser.login !== user.login));
          setAdmins((prevAdmins) => prevAdmins?.filter((prevAdmin) => prevAdmin.login !== user.login));
          setAdmins((prevAdmins) => [...prevAdmins, user]);
        });

        socket.on('demotedUser', (user: User) => {
          setAdmins((prevAdmins) => prevAdmins?.filter((prevAdmin) => prevAdmin.login !== user.login));
          setUsers((prevUsers) => prevUsers?.filter((prevUser) => prevUser.login !== user.login));
          setUsers((prevUsers) => [...prevUsers, user]);
        });

        socket.on('promotedInChannel', (channel: Channel) => {
          if (channel.name === name) {
            setRole('admin');
          }
        });

        socket.on('demotedInChannel', (channel: Channel) => {
          if (channel.name === name) {
            setRole('user');
          }
        });

        socket.on('removedSanction', (user: User, role: string) => {
          setBanned((prevBanned) => prevBanned?.filter((banned) => banned.login !== user.login));
          setMuted((prevMuted) => prevMuted?.filter((muted) => muted.login !== user.login));
        });
      }

      return (() => {
        if (socket) {
          socket.off('updatedChannel');
          socket.off('deletedChannel');
          socket.off('newUser');
          socket.off('removedUser');
          socket.off('mutedUser');
          socket.off('bannedUser');
          socket.off('promotedUser');
          socket.off('demotedUser');
          socket.off('promotedInChannel');
          socket.off('demotedInChannel');
          socket.off('removedSanction');
          socket.emit('manageChannelDetailsRoom', {
            channelName: name,
            action: 'leave',
          });
        }
      });
    }
  }, [login, name, socket]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    api
      .get(`/users/${searchUserLogin}/preview`)
      .then(response => {
        setIsNotFound(false);
        setFoundUser(response.data);
        setSearchUserLogin('');
      })
      .catch(error => {
        // console.log('error user not found: ', error);
        setIsNotFound(true);
        setSearchUserLogin('');
      })
  };

  const handleAddToChannel = () => {
    if (socket && foundUser) {
      socket.emit('addToChannel', {
        channelName: name,
        userLogin: foundUser.login,
      });
      setIsNotFound(false);
      setFoundUser(null);
      setSearchUserLogin('');
    }
  }

  const handleCancelSearch = () => {
    setIsNotFound(false);
    setFoundUser(null);
    setSearchUserLogin('');
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchUserLogin(event.target.value);
  }


  const openChannelUpdatePopup = () => {
    setChannelUpdateIsOpen(true);
  }

  const closeChannelUpdatePopup = () => {
    setChannelUpdateIsOpen(false);
  }

  const handleChannelUpdate = (type: 'public' | 'private' | 'protected', password: string | null) => {
    if (socket) {
      socket.emit('updateChannel', {
        name: name,
        type: type,
        password: password,
      });
    }
  }

  const openSanctionPopup = (user: User) => {
    setSanctionUser(user);
  }

  const closeSanctionPopup = () => {
    setSanctionUser(undefined);
  }

  const handleSanction = (user: User, type: 'kick' | 'ban' | 'mute', date: string | null) => {
    if (socket) {
      if (type === 'kick' && !date) {
        socket.emit('kickFromChannel', {
          channelName: name,
          userLogin: user.login,
        });
      } else if ((type === 'ban' || type === 'mute') && date) {
        socket.emit('sanctionForChannel', {
          channelName: name,
          userLogin: user.login,
          type: type,
          timeout: date,
        });
      }
    }
  }

  const handleAdministration = (user: User) => {
    if (socket) {
      socket.emit('administrateForChannel', {
        channelName: name,
        userLogin: user.login,
      });
    }
  }

  const handleDeleteChannel = () => {
    if (socket) {
      socket.emit('deleteChannel', {
        name: name,
      });
    }
  }

  const handleLeaveChannel = () => {
    if (socket) {
      socket.emit('leaveChannel', {
        name: name,
      });
    }
  }

  if (isError) {
    router.push('/chat');
    return (
      <ForbiddenError />
    );
  } else if (isDeleted) {
    router.push('/chat');
    return (
      <Loading />
    );
  } else if (isResponse) {
    return (
		<div className="details_main">
			<div className="search_add_cancel">
				{(role === 'owner' || role === 'admin') && (
				<div className="search_d" >
					{!foundUser ? (
					<Form onSubmit={handleSearchSubmit} className="search_details">
						<Form.Control
						type="text"
						value={searchUserLogin}
						onChange={handleSearchChange}
						placeholder="Search users"
						/>
					</Form>
					) : (
					<>
					<div className="after_search">
						<UserPreview user={foundUser} />
						<Button className="add_button" onClick={handleAddToChannel}>Add</Button>
						<Button className="cancel_button" onClick={handleCancelSearch}>Cancel</Button>
					</div>
					</>
					)}
					{isNotFound && (
					<p>User not found</p>
					)}
				</div>
				)}
			{/* </div> */}

			<div className="channel name" >
				<text>{name}</text>
				<text>{type}</text>
				{/* <h1 style={{ color: 'red', marginLeft: '0px'}}><b>Active Channel:</b></h1>
				<h3 style={{ color: 'green', marginLeft: '0px'}}>{name}</h3>
				<h3 style={{ color: 'yellow', marginLeft: '0px'}}><b>Status:</b>{type}</h3> */}
			</div>

        {role === 'owner' && (
          <>
		  <div className="channel_settings" >
            <button className="channel_settings_button" onClick={openChannelUpdatePopup}>Channel Settings</button>
            <ChannelUpdatePopup
              isOpen={channelUpdateIsOpen}
              onClose={closeChannelUpdatePopup}
              type={type}
              onUpdate={(type, password) => handleChannelUpdate(type, password)}
            />
			</div>
          </>
        )}

		<div className="channel_owner" >
			<h1 style={{ color: 'black'}}><b>Channel Owner</b></h1>
			<UserPreview user={owner} />
		</div>

		<div className="admins_container" >
        <h1 style={{ color: '#c5dcf57e'}}>Admins</h1>
		<div className="admins_inside" >
        {admins && admins.map((user: User) => (
          <li key={user.login} >
            <UserPreview key={user.login} user={user} />
            {(role === 'owner' || role === 'admin') && (
              <div className="admin_buttons">
                <button className="details_sanction_button" onClick={() => openSanctionPopup(user)} >Sanction</button>
                <SanctionPopup
                  user={sanctionUser}
                  onClose={closeSanctionPopup}
                  onSubmit={(user, type, date) => handleSanction(user, type, date)}
                />
                <button className="details_administer_button" onClick={() => handleAdministration(user)} >Administer</button>
              </div>
            )}
          </li>
        ))}
		</div>
		</div>
		<div className="users_container" >
        <h1 style={{ color: '#c5dcf57e'}}>Users</h1>
		<div className="users_inside" >
        {users && users.map((user: User) => (
          <li key={user.login} >
            <UserPreview key={user.login} user={user} />
            {(role === 'owner' || role === 'admin') && (
              <div className="users_buttons">
                <button className="details_sanction_button" onClick={() => openSanctionPopup(user)} >Sanction</button>
                <SanctionPopup
                  user={sanctionUser}
                  onClose={closeSanctionPopup}
                  onSubmit={(user, type, date) => handleSanction(user, type, date)}
                />
                <button className="details_administer_button" onClick={() => handleAdministration(user)} >Administer</button>
              </div>
            )}
          </li>
        ))}
		</div>
		</div>
		<div className="muted_container" >
        <h1 style={{ color: '#c5dcf57e' }}>Muted</h1>
		<div className="muted_inside" >
        {muted && muted.map((user: User) => (
          <li key={user.login} >
            <UserPreview key={user.login} user={user} />
            {(role === 'owner' || role === 'admin') && (
              <div className="muted_buttons">
                <button className="details_sanction_button" onClick={() => openSanctionPopup(user)} >Sanction</button>
                <SanctionPopup
                  user={sanctionUser}
                  onClose={closeSanctionPopup}
                  onSubmit={(user, type, date) => handleSanction(user, type, date)}
                />
                <button className="details_administer_button" onClick={() => handleAdministration(user)} >Administer</button>
              </div>
            )}
          </li>
        ))}
		</div>
		</div>
		<div className="banned_container">
        <h1 style={{ color: '#c5dcf57e' }}>Banned</h1>
		<div className="banned_inside">
        {banned && banned.map((user: User) => (
          <li key={user.login} >
            <UserPreview key={user.login} user={user} />
          </li>
        ))}
		</div>
		</div>
		<div className="delete_button_container" >
        {role === 'owner' && (
          <button className="delete_button" onClick={handleDeleteChannel}>Delete</button>
        )}
        {(role === 'admin' || role === 'user') && (
          <button className="details_leave_button"  onClick={handleLeaveChannel}>Leave</button>
        )}
		</div>
      </div>
    </div>
  );
  } else {
    return (
      <Loading />
    );
  }
};

export default ChannelDetails;
