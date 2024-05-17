import { SocketContext } from "@/contexts/SocketContext";
import api from "@/utils/axios";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { Matched } from "../pong/queue";
import UserPreview, { User } from "../userPreview";
import { AuthContext } from "@/contexts/AuthContext";
import { Channel } from "./channelPreview";
import { Direct } from "./directPreview";
import './conversation.css';

import ForbiddenError from "../error/forbidden";
import Loading from "../loading";

interface Message {
  id: string;
  author: User;
  content: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

interface ConversationProps {
  id: string;
}

const Conversation: React.FC<ConversationProps> = ({ id }) => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [role, setRole] = useState<'user' | 'muted'>('user');
  const [invites, setInvites] = useState<User[]>([]);
  const [isDeleted, setIsDeleted] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isInviting, setIsInviting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isResponse, setIsResponse] = useState(false);

  useEffect(() => {
    const handleHideConversation = (direct: Direct) => {
      if (id === direct.chat) {
        setIsDeleted(true);
      }
    }

    if (id) {
      const getMessages = () => {
        api
          .get(`/chat/${id}/messages`)
          .then(response => {
            setIsResponse(true);
            setMessages(response.data.messages);
            setRole(response.data.role);
          })
          .catch(error => {
            setIsResponse(false);
            // console.log('error chat messages: ', error);
            if (error.response.data.message === 'not a channel user') {
              setIsError(true);
            }
          })
      }

      getMessages();

      if (socket && user) {
        // socket.on('error', (error: any) => {
        //   console.log('error: ', error);
        // });

        socket.emit('manageChatRoom', {
          chatId: id,
          action: 'join',
        });

        socket.on('newMessage', (message: Message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
        });

        socket.on('updatedMessage', (message: Message) => {
          setMessages((prevMessages) => 
            prevMessages.map((prevMessage) =>
              prevMessage.id === message.id
                ? { ...prevMessage, ...message }
                : prevMessage
            )
          );
        });

        socket.on('deletedMessage', (message: Message) => {
          setMessages((prevMessages) => prevMessages.filter((prevMessage) => prevMessage.id !== message.id));
        });

        socket.on('mutedInChat', (chatId: string) => {
          if (chatId === id) {
            setRole('muted');
          }
        });

        socket.on('removedSanctionInChat', (chatId: string) => {
          if (chatId === id) {
            setRole('user');
          }
        });

        socket.on('inviteToPlay', (invite: User) => {
          if (user.login !== invite.login) {
            setInvites((prevInvites) => [...prevInvites, invite]);
          }
        });

        socket.on('canceledInvite', (invite: User) => {
          if (user.login !== invite.login) {
            setInvites((prevInvites) => prevInvites.filter((prevInvite) => prevInvite.login !== invite.login));
          }
        });

        socket.on('acceptedInvite', (invite: User) => {
          if (user.login !== invite.login) {
            setInvites((prevInvites) => prevInvites.filter((prevInvite) => prevInvite.login !== invite.login));
          }
        });

        socket.on('matched', (matched: Matched) => {
          router.push(`/game/${matched.id}?homePlayer=${matched.homePlayer.nickname}&foreignPlayer=${matched.foreignPlayer.nickname}`);
        });

        socket.on('deletedChannel', (channel: Channel) => {
          if (id === channel.chat) {
            setIsDeleted(true);
          }
        });

        socket.on('hiddenDirect', handleHideConversation);
      }

      return (() => {
        if (socket) {
          socket.off('newMessage');
          socket.off('updatedMessage');
          socket.off('deletedMessage');
          socket.off('inviteToPlay');
          socket.off('canceledInvite');
          socket.off('acceptedInvite');
          socket.off('matched');
          socket.off('deletedChannel');
          socket.off('hiddenDirect', handleHideConversation);
          socket.emit('manageChatRoom', {
            chatId: id,
            action: 'leave',
          });
        }
      })
    } 
  }, [id, role, socket, user, router])

  useEffect(() => {
    return (() => {
      if (socket && isInviting) {
        socket.emit('cancelInvite', {
          chatId: id,
        });
        setIsInviting(false);
      }
    })
  }, [ socket, isInviting, id]);

  const handleCancelInvite = () => {
    if (socket && id) {
      socket.emit('cancelInvite', {
        chatId: id,
      });
      setIsInviting(false);
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = () => {
    if (message === '') {
      return ;
    }
    if (socket) {
      socket.emit('postMessage', {
        chatId: id,
        content: message,
      });
      setMessage('');
    }
  };

  const handleSendInvite = () => {
    if (socket && id) {
      socket.emit('sendInvite', {
        chatId: id,
      });
      setIsInviting(true);
    }
  }

  const handleAcceptInvite = (invite: User) => {
    if (socket && id) {
      socket.emit('acceptInvite', {
        chatId: id,
        userLogin: invite.login,
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
<div className="conversation_main">
	<div className='conversation'>
		<div className="conversation_channel_name">
			{/* Name of Current Channel */}
		</div> 
  		<div className='messages_space_container' >
			<div className='messages_space'  >
				{messages && messages.map((message, index) => (
				<div className="message" key={index}>
					<UserPreview user={message.author} />
					<div className="little_message" >
						{message.content}
					</div>
				</div>
					))}
			</div>
		</div>
	</div>
    {role === 'user' && (
    <div className="message_bar">
          <Card>
            <Card.Body>
              <input
                // className="message_bar_text_field"
                style={{ width: '100vh', height: '35px', backgroundColor: '#112b47', marginLeft: '35vh' }}
                type="text"
                value={message}
                onChange={handleInputChange}
                placeholder="Your Message"
              />
              <button 
                className= "message_bar_send_button" 
                onClick={handleSendMessage}
				// style={{ backgroundColor: 'black', color: 'yellow', border: '1px solid white'  }}
              >
                Send
              </button>



              <div className="invites_container" >
                {isInviting ? (
                    <button className="invites_cancel_button" onClick={handleCancelInvite}>
                      cancel
                    </button>
                ) : (
                  <div>
                    <button className="invites_invite_button" onClick={handleSendInvite}>
                      Invite
                    </button>
                    {invites && invites.map((invite, index) => (
                      <div className="invite" key={index}>
                        <button className="invites_accept_button" value={invite.nickname} onClick={() => handleAcceptInvite(invite)}>
                          accept
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
  } else {
    return (
      <Loading />
    );
  }
}

export default Conversation;
