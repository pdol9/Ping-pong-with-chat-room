import { SocketContext } from "@/contexts/SocketContext";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import './channelPreview.css'


export interface Channel {
  name: string;
  type: 'public' | 'private' | 'protected';
  chat: string;
}

interface ChannelPreviewProps {
  channel: Channel | null;
  onDelete: () => void;
}

const ChannelPreview: React.FC<ChannelPreviewProps> = ({ channel, onDelete }) => {
  const { socket } = useContext(SocketContext);
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<'public' | 'private' | 'protected'>('public');
  const [chat, setChat] = useState<string>('');

  useEffect(() => {
    if (socket && channel) {
      // socket.on('error', (error: any) => {
      //   console.log('error: ', error);
      // });

      socket.emit('manageChannelPreviewRoom', {
        channelName: channel.name,
        action: 'join',
      });
      setName(channel.name);
      setType(channel.type);
      setChat(channel.chat);

      socket.on('updatedChannel', (chan: Channel) => {
        if (channel.name === chan.name) {
          setType(chan.type);
        }
      });

      socket.on('deletedChannel', (chan: Channel) => {
        if (channel.name === chan.name) {
          onDelete();
        }
      });
    }

    return () => {
      if (socket && channel) {
        socket.emit('manageChannelPreviewRoom', {
          channelName: channel.name,
          action: 'leave',
        });
      }
    }
  }, [socket, channel, onDelete]);

  const handleChannelClick = () => {
    if (name) {
      router.push(`/chat/channel/${name}`);
    }
  };

  return (
    <button className='channel' onClick={handleChannelClick}>
      <text>{name}</text>
      <text>{type}</text>
    </button>
  )
}

export default ChannelPreview;
