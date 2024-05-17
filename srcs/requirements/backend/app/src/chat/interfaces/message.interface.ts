import { UserPreview } from 'src/user/interfaces/user.interface';

interface IMessage {
  id: string;
  author: UserPreview;
  content: string;
}

export interface MessageDetails extends IMessage {
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
