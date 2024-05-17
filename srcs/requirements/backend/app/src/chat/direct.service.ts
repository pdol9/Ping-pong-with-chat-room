import { Inject, Injectable, forwardRef } from '@nestjs/common';
import Direct from './entities/direct.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/user/entities/user.entity';
import { DirectDetails, DirectPreview } from './interfaces/direct.interface';
import { ChatService } from './chat.service';

@Injectable()
export class DirectService {
  constructor(
    @InjectRepository(Direct)
    private readonly directRepository: Repository<Direct>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  async getAllUserDirects(login: string) {
    const user = await this.userService.findByLogin(login, {
      directs: {
        users: true,
        chat: true,
      },
    });
    const directs = await Promise.all(
      user.directs
        ?.filter((direct: Direct) => direct.hidden === false)
        .map(async (direct: Direct) => {
          const other = this.getOtherUser(login, direct);
          const dir = await this.findDirectByUsers(login, other.login);
          return this.getDirectPreview(other, dir);
        }),
    );
    return directs;
  }

  getOtherUser(login: string, direct: Direct) {
    const found = direct.users.find((user) => user.login !== login);
    return found;
  }

  getDirectPreview(user: User, direct: Direct) {
    const usersPreview = this.userService.getPreview(user);
    const directPreview: DirectPreview = {
      ...usersPreview,
      chat: direct.chat.id,
    };
    return directPreview;
  }

  async getDirectDetails(selfLogin: string, otherLogin: string) {
    const userPublicProfile = await this.userService.getPublicProfile(
      selfLogin,
      otherLogin,
    );
    const direct = await this.findDirectByUsers(selfLogin, otherLogin);
    const directDetails: DirectDetails = {
      ...userPublicProfile,
      chat: direct.chat.id,
      created_at: direct.created_at,
      updated_at: direct.updated_at,
      deleted_at: direct.deleted_at,
    };
    return directDetails;
  }

  async showDirect(login1: string, login2: string) {
    const direct = await this.createOrFindDirect(login1, login2);

    await this.setHidden(direct.id, false);
    return direct;
  }

  async hideDirect(login1: string, login2: string) {
    const direct = await this.createOrFindDirect(login1, login2);

    await this.setHidden(direct.id, true);
    return direct;
  }

  async createOrFindDirect(login1: string, login2: string) {
    const direct = await this.findDirectByUsers(login1, login2);
    return direct === null ? await this.createDirect(login1, login2) : direct;
  }

  async createDirect(login1: string, login2: string) {
    const direct = this.directRepository.create({
      users: [
        await this.userService.findByLogin(login1),
        await this.userService.findByLogin(login2),
      ],
    });
    direct.chat = this.chatService.createChat(direct);
    await this.directRepository.save(direct);
    return direct;
  }

  validateUserPrivilege(login: string, direct: Direct) {
    if (!this.isUser(login, direct)) {
      throw new Error('no access to direct messages');
    }
  }

  async secureFindDirectByUsers(login1: string, login2: string) {
    if (login1 === login2) {
      throw new Error('no direct messages with yourself');
    }
    const direct = this.findDirectByUsers(login1, login2);
    if (!direct) {
      throw new Error('no direct messages with this user');
    }
    return direct;
  }

  async findDirectByUsers(login1: string, login2: string) {
    const direct = await this.directRepository
      .createQueryBuilder('direct')
      .leftJoinAndSelect('direct.chat', 'chat')
      .leftJoinAndSelect('direct.users', 'user')
      .innerJoin('direct.users', 'user1', 'user1.login = :login1', {
        login1: login1,
      })
      .innerJoin('direct.users', 'user2', 'user2.login = :login2', {
        login2: login2,
      })
      .getOne();

    return direct;
  }

  private isUser(login: string, direct: Direct) {
    const found = direct.users.find((user) => user.login === login);
    return found ? true : false;
  }

  private async setHidden(id: string, hidden: boolean) {
    await this.directRepository.update({ id: id }, { hidden: hidden });
  }

  // testing
  // async getAllDirects() {
  //   const directs = await this.directRepository.find();
  //   return directs;
  // }
}
