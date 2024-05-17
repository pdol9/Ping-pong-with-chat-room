import Role from 'src/utils/role';
import { ChannelPreview } from './channel.interface';
import { DirectPreview } from './direct.interface';
import { MessageDetails } from './message.interface';

export interface AllChats {
  channels: ChannelPreview[];
  directs: DirectPreview[];
}

export interface MessageChat extends Role {
  messages: MessageDetails[];
}
