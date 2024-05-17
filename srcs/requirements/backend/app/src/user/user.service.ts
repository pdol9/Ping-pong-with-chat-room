import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UpdateUserDto from './dto/update-user.dto';
import {
  CreateUser,
  UserPrivateProfile,
  UserPublicProfile,
  UserPreview,
  Update,
  RankPreview,
} from './interfaces/user.interface';
import User from './entities/user.entity';
import { StatsService } from './stats.service';
import { FriendService } from './friend.service';
import { Server } from 'socket.io';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly statsService: StatsService,
    @Inject(forwardRef(() => FriendService))
    private readonly friendService: FriendService,
  ) {}

  async create(userData: CreateUser) {
    const user = this.userRepository.create(userData);
    await this.userRepository.save(user);
    user.stats = await this.statsService.createStats(user);
    return user;
  }

  validateUserAlternation(requested_login: string, session_login: string) {
    if (requested_login !== session_login) {
      throw new Error('missing rights to alternate users profile');
    }
  }

  async update(login: string, userData: UpdateUserDto) {
    const user = await this.findByLogin(login);
    if (userData.nickname) {
      const duplicate = await this.userRepository.findOne({
        where: {
          nickname: userData.nickname,
        }
      });
      if (!duplicate || duplicate.login === user.login) {
        user.nickname = userData.nickname;
      }
    }
    if (userData.bio) {
      user.bio = userData.bio;
    }

    return await this.userRepository.save(user);
  }

  async secureFindByLogin(login: string) {
    const user = await this.findByLogin(login);
    if (!user) {
      throw new Error('invalid login');
    }
    return user;
  }

  async findByLogin(login: string, relations?: any) {
    let params: any;
    if (relations) {
      params = {
        where: {
          login: login,
        },
        relations: relations,
      };
    } else {
      params = {
        where: {
          login: login,
        },
      };
    }
    const user = await this.userRepository.findOne(params);
    return user;
  }

  async findBySocketId(socketId: string, relations?: any) {
    let params: any;
    if (relations) {
      params = {
        where: {
          socketId: socketId,
        },
        relations: relations,
      };
    } else {
      params = {
        where: {
          socketId: socketId,
        },
      };
    }
    const user = await this.userRepository.findOne(params);
    return user;
  }

  async getLadder() {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.stats', 'stats')
      .orderBy('stats.xp', 'DESC')
      .getMany();

    return users;
  }

  getRankPreview(users: User[]) {
    const first20UserPreviews = users.slice(0, 20).map((user: User) => {
      return this.getPreview(user);
    });
    const rankPreview: RankPreview = {
      users: first20UserPreviews,
    };
    return rankPreview;
  }

  getPreview(user: User) {
    const userPreview: UserPreview = {
      login: user.login,
      nickname: user.nickname === '' ? user.login : user.nickname,
      status: user.status,
    };
    return userPreview;
  }

  async getPublicProfile(selfLogin: string, otherLogin: string) {
    const isFriend = await this.friendService.isFriend(selfLogin, otherLogin);
    const isPending = await this.friendService.isPending(selfLogin, otherLogin);
    const isReceiving = await this.friendService.isReceiving(
      selfLogin,
      otherLogin,
    );
    const isBlocked = await this.friendService.isBlocked(selfLogin, otherLogin);
    const user = await this.findByLogin(otherLogin);
    const userPublicProfile: UserPublicProfile = {
      role: 'user',
      login: user.login,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      nickname: user.nickname,
      bio: user.bio,
      status: user.status,
      isFriend: isFriend,
      isPending: isPending,
      isReceiving: isReceiving,
      isBlocked: isBlocked,
    };
    return userPublicProfile;
  }

  async getPrivateProfile(login: string) {
    const user = await this.findByLogin(login);
    const userPrivateProfile: UserPrivateProfile = {
      role: 'owner',
      login: user.login,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      nickname: user.nickname,
      bio: user.bio,
      status: user.status,
      mfaEnabled: user.mfaEnabled,
    };
    return userPrivateProfile;
  }

  getUpdate(user: User) {
    const update: Update = {
      nickname: user.nickname,
      bio: user.bio,
    };
    return update;
  }

  imageToDataURL(arrayBuffer: ArrayBuffer) {
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64EncodedImage = btoa(binaryString);
    const dataURL = `data:image/png;base64,${base64EncodedImage}`;
    return dataURL;
  }

  async sendEventToNonBlockedRoomMembers(
    login: string,
    server: Server,
    event: string,
    payload: any,
    sockets?: string[],
  ) {
    if (sockets) {
      const promises = sockets.map(async (socketId: string) => {
        const other = await this.findBySocketId(socketId, {
          blocked: true,
        });
        return { socketId, other };
      });

      const recipients = (await Promise.all(promises)).filter(({ other }) => {
        return (
          other &&
          !other.blocked?.some((blockedUser) => blockedUser.login === login)
        );
      });

      for (const socket of recipients) {
        server.to(socket.socketId).emit(event, payload);
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////

  //   async findRecReq(userLogin: string): Promise<UserPreview[]> {
  //     const user = await this.findByLogin(userLogin);
  //     if (!user) {
  //       throw new BadRequestException('User not found');
  //     }
  //     const recvFriendRequests = user.receivedFriendRequests.filter(request => request.pending);
  //     const recvFriendIds = recvFriendRequests.map(request => request.requestSender);
  //     const recvFriend = await this.userRepository.findByIds(recvFriendIds);

  //     const recvFriendPreviews: UserPreview[] = recvFriend.map(friend => {
  //       return this.getPreview(friend);
  //     });
  //     return recvFriendPreviews;
  //   }

  //   async findSentReq(userLogin: string): Promise<UserPreview[]> {
  //     const user = await this.findByLogin(userLogin);
  //     if (!user) {
  //       throw new BadRequestException('User not found');
  //     }
  //     const sentFriendRequests = user.sentFriendRequests.filter(request => request.pending);
  //     const sentFriendIds = sentFriendRequests.map(request => request.requestReceiver);
  //     const sentFriend = await this.userRepository.findByIds(sentFriendIds);

  //     const sentFriendPreviews: UserPreview[] = sentFriend.map(friend => {
  //       return this.getPreview(friend);
  //     });
  //     return sentFriendPreviews;
  //   }

  //   // create a friend
  //   async createFriend(userLogin: string, friendLogin: string) {
  //     const user = await this.userRepository.findOne({ where: { login: userLogin } });
  //     const friend = await this.userRepository.findOne({ where: { login: friendLogin } });
  //     if (!user || !friend) {
  //       throw new Error('User or friend not found');
  //     }
  //     const existingFriendship = await this.friendRepository.findOne({
  //       where: [
  //         { requestSender: { id: user.id }, requestReceiver: { id: friend.id } },
  //         { requestSender: { id: friend.id }, requestReceiver: { id: user.id } },
  //       ],
  //     });

  //     if (existingFriendship) {
  //       throw new Error('Friendship already exists');
  //     } else if (user.id === friend.id) {
  //         throw new Error('same user');
  //     }

  //     const userFriend = new Friend();
  //     userFriend.requestSender = user;
  //     userFriend.requestReceiver = friend;
  //     userFriend.pending = true;
  //     await this.friendRepository.save(userFriend);
  //   }

  // ///////////////////////////////////////////////////////////////

  // async confirm(userLogin: string, friendLogin: string) {
  //   const user = await this.userRepository.findOne({ where: { login: userLogin }, relations: ['receivedFriendRequests', 'sentFriendRequests'] });
  //   const friend = await this.userRepository.findOne({ where: { login: friendLogin }, relations: ['receivedFriendRequests', 'sentFriendRequests'] });

  //   if (!user || !friend) {
  //     throw new Error('User or friend not found');
  //   }
  //   user.receivedFriendRequests.forEach((userFriend) => {
  //     if (userFriend.requestSender.login === friend.login) {
  //       userFriend.pending = false;
  //     }
  //   });
  //   await this.userRepository.save([user, friend]);
  // }

  // async removeFriendshipx(userLogin: string, friendLogin: string): Promise<void> {
  //   const user = await this.userRepository.findOne({ where: { login: userLogin }, relations: ['receivedFriendRequests', 'sentFriendRequests'] });
  //   const friend = await this.userRepository.findOne({ where: { login: friendLogin }, relations: ['receivedFriendRequests', 'sentFriendRequests'] });

  //   if (!user || !friend) {
  //     throw new BadRequestException('User or friend not found');
  //   }

  //   const friendshipEntry =
  //   user.sentFriendRequests.find(userFriend =>
  //     userFriend.requestReceiver.login === friend.login &&
  //     friend.receivedFriendRequests.find(friendFriend =>
  //       friendFriend.requestSender === userFriend.requestSender &&
  //       friendFriend.requestReceiver === userFriend.requestReceiver
  //     )
  //   );

  //   if (friendshipEntry) {
  //     try {
  //       await this.friendRepository.remove(friendshipEntry);
  //     } catch (error) {
  //       throw new Error('User or friend not found');
  //     }
  //   } else {
  //     throw new Error('Friendship entry not found');
  //   }
  // }

  // ///////////////////////////////////////////////////////////////

  async socketConnect(login: string, socketId: string) {
    const user = await this.findByLogin(login);
    user.socketId = socketId;
    if (socketId === null) {
      user.status = 'offline';
    } else {
      user.status = 'online';
    }
    await this.userRepository.save(user);
    return user;
  }

  async setSession(login: string, session: string) {
    return await this.userRepository.update(
      { login: login },
      { session: session },
    );
  }

  async setMfaEnabled(login: string, enable: boolean) {
    return await this.userRepository.update(
      { login: login },
      { mfaEnabled: enable },
    );
  }

  async setMfaSecret(login: string, secret: string) {
    return await this.userRepository.update(
      { login: login },
      { mfaSecret: secret },
    );
  }

  async setAvatar(login: string, dataURL: string) {
    return await this.userRepository.update(
      { login: login },
      { avatar: dataURL },
    );
  }

  // testing
  // async getAllUsers() {
  //   const users = await this.userRepository.find();
  //   return users;
  // }
}
