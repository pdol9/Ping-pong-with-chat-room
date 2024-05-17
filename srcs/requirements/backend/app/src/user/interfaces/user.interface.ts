import Role from 'src/utils/role';

export interface CreateUser {
  login: string;
  firstname: string;
  lastname: string;
  email: string;
}

export interface UserPreview {
  login: string;
  nickname: string;
  status: string;
}

export interface UserPublicProfile extends Role {
  login: string;
  firstname: string;
  lastname: string;
  email: string;
  nickname: string;
  bio: string;
  status: string;
  isFriend: boolean;
  isPending: boolean;
  isReceiving: boolean;
  isBlocked: boolean;
}

export interface UserPrivateProfile extends Role {
  login: string;
  firstname: string;
  lastname: string;
  email: string;
  nickname: string;
  bio: string;
  status: string;
  mfaEnabled: boolean;
}

export interface Update {
  nickname: string;
  bio: string;
}

export interface RankPreview {
  users: UserPreview[];
}
