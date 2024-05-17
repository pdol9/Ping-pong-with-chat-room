import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Friend from './entities/friend.entity';
import { Repository } from 'typeorm';
import User from './entities/user.entity';
import { UserService } from './user.service';
import {
  BlockedPreview,
  FriendPreview,
  FriendPrivateDetails,
  FriendPublicDetails,
  PendingPreview,
} from './interfaces/friend.interface';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async getPublicFriends(login: string) {
    const friendPublicDetails: FriendPublicDetails = {
      role: 'user',
      friends: await this.getFriends(login),
    };
    return friendPublicDetails;
  }

  async getPrivateFriends(login: string) {
    const friendPrivateDetails: FriendPrivateDetails = {
      role: 'owner',
      friends: await this.getFriends(login),
      pending: await this.getPending(login),
      blocked: await this.getBlocked(login),
    };
    return friendPrivateDetails;
  }

  async getFriends(login: string) {
    const user = await this.userService.findByLogin(login, {
      friends: {
        users: true,
      },
      blocked: true,
    });
    const filteredFriends = this.filterBlocked(user.friends, user.blocked)
      .filter((friend: Friend) => !friend.pending)
      .map((friend: Friend) =>
        this.userService.getPreview(this.getOtherFriend(user.login, friend)),
      );
    return filteredFriends;
  }

  async getPending(login: string) {
    const user = await this.userService.findByLogin(login, {
      friends: {
        users: true,
      },
      blocked: true,
    });
    const filteredPending = this.filterBlocked(user.friends, user.blocked)
      .filter((friend: Friend) => friend.pending)
      .map((friend: Friend) => this.getPendingPreview(login, friend));
    return filteredPending;
  }

  private filterBlocked(friends: Friend[], blocked: User[]) {
    return friends?.filter(
      (friend: Friend) =>
        !friend.users.some(
          (usr: User) =>
            blocked?.some((blocked: User) => blocked.id === usr.id),
        ),
    );
  }

  async getBlocked(login: string) {
    const user = await this.userService.findByLogin(login, {
      blocked: true,
    });
    const blocked = user.blocked.map((user: User) =>
      this.userService.getPreview(user),
    );
    return blocked;
  }

  async getBlockedPreview(selfLogin: string, otherLogin: string) {
    const user = await this.userService.findByLogin(otherLogin);
    const blockedPreview: BlockedPreview = {
      ...user,
      isFriend: await this.isFriend(selfLogin, otherLogin),
      isPending: await this.isPending(selfLogin, otherLogin),
      isReceiving: await this.isReceiving(selfLogin, otherLogin),
    };
    return blockedPreview;
  }

  private getPendingPreview(login: string, friend: Friend) {
    const user = this.getOtherFriend(login, friend);
    const userPreview = this.userService.getPreview(user);
    const pendingPreview: PendingPreview = {
      ...userPreview,
      isReceiving: friend.receiverLogin === login,
    };
    return pendingPreview;
  }

  private getOtherFriend(login: string, friend: Friend) {
    const found = friend.users?.find((usr) => usr.login !== login);
    return found;
  }

  getFriendPreview(friend: Friend) {
    const userPreviews = friend.users.map((user: User) =>
      this.userService.getPreview(user),
    );
    const friendPreview: FriendPreview = {
      users: userPreviews,
      pending: friend.pending,
    };
    return friendPreview;
  }

  async secureFindFriendship(login1: string, login2: string) {
    const friendship = await this.findFriendship(login1, login2);
    if (!friendship) {
      throw new Error('no friend');
    }
    return friendship;
  }

  async findFriendship(login1: string, login2: string) {
    const friendship = await this.friendRepository
      .createQueryBuilder('friend')
      .leftJoinAndSelect('friend.users', 'user')
      .innerJoin('friend.users', 'user1', 'user1.login = :login1', {
        login1: login1,
      })
      .innerJoin('friend.users', 'user2', 'user2.login = :login2', {
        login2: login2,
      })
      .getOne();

    return friendship;
  }

  async isFriend(login1: string, login2: string) {
    const friend = await this.findFriendship(login1, login2);
    return friend && !friend.pending;
  }

  async isPending(login1: string, login2: string) {
    const friend = await this.findFriendship(login1, login2);
    return friend && friend.pending;
  }

  async isReceiving(selfLogin: string, otherLogin: string) {
    const friend = await this.findFriendship(selfLogin, otherLogin);
    return friend && friend.pending && friend.receiverLogin === selfLogin;
  }

  async isBlocked(login: string, blockLogin: string) {
    const user = await this.userService.findByLogin(login, {
      blocked: true,
    });
    const found = user.blocked.find((usr: User) => usr.login === blockLogin);
    return found ? true : false;
  }

  async createFriendship(sendLogin: string, recvLogin: string) {
    const friendship = this.friendRepository.create({
      receiverLogin: recvLogin,
      pending: true,
      users: [
        await this.userService.findByLogin(sendLogin),
        await this.userService.findByLogin(recvLogin),
      ],
    });
    await this.friendRepository.save(friendship);
    return friendship;
  }

  async confirmFriendship(selfLogin: string, otherLogin: string) {
    const friend = await this.findFriendship(selfLogin, otherLogin);
    friend.pending = false;
    const confirmed = await this.friendRepository.save(friend);
    return confirmed;
  }

  async removeFriendship(selfLogin: string, otherLogin: string) {
    const friend = await this.findFriendship(selfLogin, otherLogin);
    const removed = await this.friendRepository.remove(friend);
    return removed;
  }

  async blockUser(login: string, blockLogin: string) {
    const user = await this.userService.findByLogin(login, {
      blocked: true,
    });
    const block = await this.userService.findByLogin(blockLogin);
    user.blocked.push(block);
    await this.userRepository.save(user);
  }

  async unblockUser(login: string, blockLogin: string) {
    const user = await this.userService.findByLogin(login, {
      blocked: true,
    });
    user.blocked = user.blocked.filter((usr) => usr.login !== blockLogin);
    await this.userRepository.save(user);
  }

  async validateCreateRequest(sendLogin: string, recvLogin: string) {
    const existingFriendship = await this.findFriendship(sendLogin, recvLogin);
    if (existingFriendship) {
      throw new Error('already a friend');
    }
    if (sendLogin === recvLogin) {
      throw new Error('cannot be friend with yourself');
    }
  }

  async validateConfirmRequest(selfLogin: string, otherLogin: string) {
    const friend = await this.findFriendship(selfLogin, otherLogin);
    if (selfLogin !== friend.receiverLogin) {
      throw new Error('not the request receiver');
    }
    if (friend.pending === false) {
      throw new Error('already accepted');
    }
  }

  async validateBlocking(login: string, blockLogin: string) {
    if (await this.isBlocked(login, blockLogin)) {
      throw new Error('already blocked');
    }
    if (login === blockLogin) {
      throw new Error('cannot block yourself');
    }
  }

  async validateUnblocking(login: string, blockLogin: string) {
    if (!(await this.isBlocked(login, blockLogin))) {
      throw new Error('not blocked');
    }
  }
}
