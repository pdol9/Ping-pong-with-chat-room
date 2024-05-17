import {
  UserPreview,
  UserPublicProfile,
} from 'src/user/interfaces/user.interface';

export interface DirectPreview extends UserPreview {
  chat: string;
}

export interface DirectDetails extends UserPublicProfile {
  chat: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
