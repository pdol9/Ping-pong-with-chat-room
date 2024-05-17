import Role from 'src/utils/role';
import { UserPreview } from './user.interface';

export interface FriendPreview {
  users: UserPreview[];
  pending: boolean;
}

export interface PendingPreview extends UserPreview {
  isReceiving: boolean;
}

export interface FriendPublicDetails extends Role {
  friends: UserPreview[];
}

export interface FriendPrivateDetails extends Role {
  friends: UserPreview[];
  pending: PendingPreview[];
  blocked: UserPreview[];
}

export interface BlockedPreview extends UserPreview {
  isFriend: boolean;
  isPending: boolean;
  isReceiving: boolean;
}
