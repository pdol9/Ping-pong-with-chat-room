import { UserPreview } from 'src/user/interfaces/user.interface';
import Role from 'src/utils/role';

interface IChannel {
  name: string;
  type: string;
}

export interface ChannelPreview extends IChannel {
  chat: string;
}

export interface ChannelDetails extends ChannelPreview, Role {
  owner: UserPreview;
  admins: UserPreview[];
  users: UserPreview[];
  muted: UserPreview[];
  banned: UserPreview[];
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
