import api from "@/utils/axios";
import { useContext, useEffect, useState } from "react";
import { Button, Card, Form, ListGroup } from "react-bootstrap";
import UserPreview, { User } from "../userPreview";
import ChannelCreatePopup from "./channelCreatePopup";
import ChannelPreview, { Channel } from "./channelPreview";
import DirectPreview, { Direct } from "./directPreview";
import { useRouter } from "next/router";
import { SocketContext } from "@/contexts/SocketContext";
import PasswordPrompt from "./passwordPrompt";
import './userChannels.css'

interface UserChannelProps {
  login: string;
}

const UserChannels: React.FC<UserChannelProps> = ({ login }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter()
  const { socket } = useContext(SocketContext);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [directs, setDirects] = useState<Direct[]>([]);
  const [searchChannelName, setSearchChannelName] = useState('');
  const [isNotFound, setIsNotFound] = useState(false);
  const [foundChannel, setFoundChannel] = useState<Channel | null>(null);
  const [channelCreateIsOpen, setChannelCreateIsOpen] = useState(false);
  const [passwordPromptIsOpen, setPasswordPromptIsOpen] = useState(false);

  useEffect(() => {
    if (login) {
      const getUserPreview = () => {
        api
          .get(`/users/${login}/preview`)
          .then(response => {
            setUser(response.data);
          })
          .catch(error => {
            // console.log('error user preview in channels: ', error);
          })
      }
      const getUserChannels = () => {
        api
          .get(`/chat/all`)
          .then(response => {
            setChannels(response.data.channels);
            setDirects(response.data.directs);
          })
          .catch(error => {
            // console.log('error match history: ', error);
          })
      }

      if (socket) {
        // socket.on('error', (error: any) => {
        //   console.log('error: ', error);
        // });

        socket.on('joinedChannel', (channel: Channel) => {
          setChannels((prevChannels) => prevChannels.filter((prevChannel) => prevChannel.name !== channel.name));
          setChannels((prevChannels) => [...prevChannels, channel]);
        });
        socket.on('shownDirect', (direct: Direct) => {
          // console.log(direct.login);
          setDirects((prevDirects) => prevDirects.filter((prevDirect) => prevDirect.login !== direct.login));
          setDirects((prevDirects) => [...prevDirects, direct]);
        });
      }

      getUserPreview();
      getUserChannels();

      return (() => {
        if (socket) {
          socket.off('joinedChannel');
          socket.off('shownDirect');
        }
      })
    }
  }, [login, socket]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    api
      .get(`/chat/channel/${searchChannelName}/preview`)
      .then(response => {
        setIsNotFound(false);
        setFoundChannel(response.data);
        setSearchChannelName('');
      })
      .catch(error => {
        // console.log('error channel not found: ', error);
        setIsNotFound(true);
        setSearchChannelName('');
      })
  };

  const handleJoin = () => {
    if (socket && foundChannel) {
      if (foundChannel.type === 'protected') {
        setPasswordPromptIsOpen(true);
        return ;
      }
      socket.emit('joinChannel', {
        name: foundChannel.name,
      });
    }
  }

  const closePasswordPrompt = () => {
    setPasswordPromptIsOpen(false);
  }

  const handlePasswordJoin = (password: string) => {
    if (socket && foundChannel) {
      socket.emit('joinChannel', {
        name: foundChannel.name,
        password: password,
      });
    }
  }

  const handleCancelSearch = () => {
    setIsNotFound(false);
    setFoundChannel(null);
    setSearchChannelName('');
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchChannelName(event.target.value);
  }

  const openChannelCreatePopup = () => {
    setChannelCreateIsOpen(true);
  }

  const closeChannelCreatePopup = () => {
    setChannelCreateIsOpen(false);
  }

  const handleNewChannel = (channel: Channel) => {
    setChannels((prevChannels) => [...prevChannels, channel]);
    router.push(`/chat/channel/${channel.name}`);
  }

  const handleChannelDelete = (channel: Channel) => {
    setChannels((prevChannels) => prevChannels.filter((prevChannel) => prevChannel.name !== channel.name));
  }

  const handleDirectHide = (direct: Direct) => {
    setDirects((prevDirects) => prevDirects.filter((prevDirect) => prevDirect.login !== direct.login));
  }

  return (
    <div className="users-channels">
      <Card>
        <Card.Header>
			<div className='user_avatar_status' >
          		<UserPreview user={user} />
		  	</div>
        </Card.Header>

        <Card.Header>
		<div className='search' >
          {!foundChannel ? (
            <Form onSubmit={handleSearchSubmit} className="search">
              <Form.Control
                type="text"
                value={searchChannelName}
                onChange={handleSearchChange}
                placeholder="Search chats"
              />
            </Form>
          ) : (
            <>
              <PasswordPrompt
                isOpen={passwordPromptIsOpen}
                onClose={closePasswordPrompt}
                onSubmit={handlePasswordJoin}
              />
              <ChannelPreview channel={foundChannel} onDelete={() => setFoundChannel(null)} />
              <Button className="search_join_button" onClick={handleJoin}>Join</Button>
              <Button className="search_cancel_button"onClick={handleCancelSearch}>Cancel</Button>
            </>
          )}
          {isNotFound && (
            <p>channel not found</p>
          )}
		  </div>
        </Card.Header>
        <Card.Header>
		<div className='Join_Button_Container' >
          <Button className='Join_Button'  onClick={openChannelCreatePopup}> + </Button>
          <ChannelCreatePopup
            isOpen={channelCreateIsOpen}
            onClose={closeChannelCreatePopup}
            onCreate={handleNewChannel}
          />
		  </div>
        </Card.Header>
      </Card>
      <Card>
	
	  <div className='all_channels_container' >
        All Channels
        <div className='all_channels_container_all'>
          {channels && channels.map((channel: Channel) => (
            <li key={channel.name}>
              <ChannelPreview channel={channel} onDelete={() => handleChannelDelete(channel)} />
            </li>
          ))}
		  </div>
        </div>


		<div className='all_direct_container'>
			Direct Messages
			<div className='all_direct_container_all'>
				{directs && directs.map((direct: Direct) => (
					<li style={{ color: 'yellow'}} key={direct.login}>
					<DirectPreview direct={direct} onHide={() => handleDirectHide(direct)} />
					</li>
				))}
			</div>
		</div>
      </Card>
    </div>
  );
}

export default UserChannels;
