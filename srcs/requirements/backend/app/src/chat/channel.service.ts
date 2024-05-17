import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import Channel from './entities/channel.entity';
import User from 'src/user/entities/user.entity';
import CreateChannelDto from './dto/create-channel.dto';
import { ChannelDetails, ChannelPreview } from './interfaces/channel.interface';
import { UserService } from 'src/user/user.service';
import UpdateChannelDto from './dto/update-channel.dto';
import JoinChannelDto from './dto/join-channel.dto';
import CreateSanctionDto from './dto/create-sanction.dto';
import Sanction from './entities/sanction.entity';
import { ChatService } from './chat.service';
import { Server } from 'socket.io';
import DeleteChannelDto from './dto/delete-channel.dto';
import LeaveChannelDto from './dto/leave-channel.dto';
import AdministrateChannelDto from './dto/administrate-channel.dto';
import { genSaltSync, hashSync, compareSync } from 'bcrypt';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(Sanction)
    private readonly sanctionRepository: Repository<Sanction>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  saltRounds = 10;

  async getAllUserChannels(login: string) {
    const user = await this.userService.findByLogin(login, {
      ownChannels: true,
      admChannels: true,
      usrChannels: true,
    });
    const ownChannels = user.ownChannels.map((channel: Channel) =>
      this.getChannelPreview(channel),
    );
    const admChannels = user.admChannels.map((channel: Channel) =>
      this.getChannelPreview(channel),
    );
    const usrChannels = user.usrChannels.map((channel: Channel) =>
      this.getChannelPreview(channel),
    );
    const channels = [...ownChannels, ...admChannels, ...usrChannels];
    return channels;
  }

  async validateChannelCreation(data: CreateChannelDto) {
    if (await this.findChannelByName(data.name)) {
      throw new Error('channel already existing');
    }
    const password = data.password === undefined ? null : data.password;
    this.validateChannelProtection(data.type, password);
  }

  async createChannel(login: string, data: CreateChannelDto) {
    if (data.password) {
      const salt = genSaltSync(this.saltRounds);
      const hashedPw = hashSync(data.password, salt);
      data.password = hashedPw;
    }
    const channel = this.channelRepository.create(data);
    channel.owner = await this.userService.findByLogin(login);
    channel.chat = this.chatService.createChat(channel);
    await this.channelRepository.save(channel);
    return channel;
  }

  async validateViewChannelDetails(login: string, name: string) {
    const channel = await this.findChannelByName(name, {
      owner: true,
      admins: true,
      users: true,
    });
    this.validateUserPrivilege(login, channel);
  }

  async getChat(login: string, name: string) {
    const channel = await this.findChannelByName(name, {
      owner: true,
      admins: true,
      users: true,
    });
    this.validateUserPrivilege(login, channel);
    return channel.chat.id;
  }

  getChannelPreview(channel: Channel) {
    const channelPreview: ChannelPreview = {
      type: channel.type,
      name: channel.name,
      chat: channel.chat.id,
    };
    return channelPreview;
  }

  async getChannelDetails(login: string, name: string) {
    const channel = await this.findChannelByName(name, {
      owner: true,
      admins: true,
      users: true,
      sanctions: {
        user: true,
      },
    });
    const role = this.getChannelRole(login, channel);
    const channelPreview = this.getChannelPreview(channel);
    const owner = this.userService.getPreview(channel.owner);
    const nonSanctionedAdmins = channel.admins
      .filter((admin: User) => {
        return !channel.sanctions?.some(
          (sanction: Sanction) => sanction.user.login === admin.login,
        );
      })
      .map((admin: User) => {
        return this.userService.getPreview(admin);
      });
    const nonSanctionedUsers = channel.users
      .filter((user: User) => {
        return !channel.sanctions?.some(
          (sanction: Sanction) => sanction.user.login === user.login,
        );
      })
      .map((user: User) => {
        return this.userService.getPreview(user);
      });
    const mutedUsers = channel.sanctions
      ?.filter((sanction: Sanction) => sanction.type === 'mute')
      .map((sanction: Sanction) => this.userService.getPreview(sanction.user));
    const bannedUsers = channel.sanctions
      ?.filter((sanction: Sanction) => sanction.type === 'ban')
      .map((sanction: Sanction) => this.userService.getPreview(sanction.user));
    const channelDetails: ChannelDetails = {
      role: role,
      ...channelPreview,
      owner: owner,
      admins: nonSanctionedAdmins,
      users: nonSanctionedUsers,
      muted: mutedUsers,
      banned: bannedUsers,
      created_at: channel.created_at,
      updated_at: channel.updated_at,
      deleted_at: channel.deleted_at,
    };
    return channelDetails;
  }

  async validateUpdateChannelData(data: UpdateChannelDto) {
    const channel = await this.findChannelByName(data.name);
    const type = data.type === undefined ? channel.type : data.type;
    const password =
      data.password === undefined ? channel.password : data.password;
    this.validateChannelProtection(type, password);
  }

  async updateChannel(login: string, data: UpdateChannelDto) {
    const channel = await this.findChannelByName(data.name, {
      owner: true,
    });
    this.validateOwnerPrivilege(login, channel);
    if (data.password) {
      const salt = genSaltSync(this.saltRounds);
      const hashedPw = hashSync(data.password, salt);
      data.password = hashedPw;
    }
    const updated = await this.channelRepository.save({ ...channel, ...data });
    return updated;
  }

  async deleteChannel(login: string, data: DeleteChannelDto) {
    const channel = await this.findChannelByName(data.name, {
      owner: true,
    });
    this.validateOwnerPrivilege(login, channel);
    const deleted = await this.channelRepository.remove(channel);
    return deleted;
  }

  async joinChannel(login: string, data: JoinChannelDto) {
    await this.validateJoiningRights(login, data);
    const channel = await this.findChannelByName(data.name, {
      users: true,
    });
    await this.addChannelUser(login, channel);
  }

  async leaveChannel(login: string, data: LeaveChannelDto) {
    await this.validateLeavingRights(login, data);
    await this.removeChannelUserOrAdmin(login, data.name);
  }

  async addToChannel(login: string, data: AdministrateChannelDto) {
    await this.validateAddingRights(login, data);
    const channel = await this.findChannelByName(data.channelName, {
      users: true,
    });
    await this.addChannelUser(data.userLogin, channel);
  }

  async kickFromChannel(login: string, data: AdministrateChannelDto) {
    await this.validateAdministratingRights(login, data);
    await this.removeChannelUserOrAdmin(data.userLogin, data.channelName);
  }

  async sanctionForChannel(login: string, data: CreateSanctionDto) {
    const administrateChannelDto: AdministrateChannelDto = {
      channelName: data.channelName,
      userLogin: data.userLogin,
    };
    await this.validateAdministratingRights(login, administrateChannelDto);
    await this.sanctionChannelUser(data);
  }

  async administrateForChannel(login: string, data: AdministrateChannelDto) {
    await this.validateAdministratingRights(login, data);
    await this.administrateChannelUser(data.userLogin, data.channelName);
  }

  async secureFindChannelByName(name: string) {
    const channel = await this.findChannelByName(name);
    if (!channel) {
      throw new Error('bad channel name');
    }
    return channel;
  }

  async findChannelByName(name: string, relations?: any) {
    let params: any;
    if (relations) {
      params = {
        where: {
          name: name,
        },
        relations: relations,
      };
    } else {
      params = {
        where: {
          name: name,
        },
      };
    }
    const channel = await this.channelRepository.findOne(params);
    return channel;
  }

  private getChannelRole(login: string, channel: Channel) {
    if (this.isChannelOwner(login, channel)) {
      return 'owner';
    } else if (this.isChannelAdmin(login, channel)) {
      return 'admin';
    } else if (this.isChannelUser(login, channel)) {
      return 'user';
    }
  }

  private isChannelOwner(login: string, channel: Channel) {
    return login === channel.owner.login;
  }

  isChannelAdmin(login: string, channel: Channel) {
    if (this.isChannelOwner(login, channel)) {
      return true;
    }
    const found = channel.admins?.find((admin) => admin.login === login);
    return found ? true : false;
  }

  isChannelUser(login: string, channel: Channel) {
    if (this.isChannelAdmin(login, channel)) {
      return true;
    }
    const found = channel.users?.find((user) => user.login === login);
    return found ? true : false;
  }

  isMutedChannelUser(login: string, channel: Channel) {
    const found = channel.sanctions?.find(
      (sanction) => sanction.user.login === login && sanction.type === 'mute',
    );
    return found ? true : false;
  }

  private isBannedChannelUser(login: string, channel: Channel) {
    const found = channel.sanctions?.find(
      (sanction) => sanction.user.login === login && sanction.type === 'ban',
    );
    return found ? true : false;
  }

  private async addChannelUser(login: string, channel: Channel) {
    const user = await this.userService.findByLogin(login);
    channel.users.push(user);
    await this.channelRepository.save(channel);
  }

  private async addChannelAdmin(login: string, channel: Channel) {
    const user = await this.userService.findByLogin(login);
    channel.admins.push(user);
    await this.channelRepository.save(channel);
  }

  private async removeChannelUserOrAdmin(login: string, name: string) {
    const channel = await this.findChannelByName(name, {
      owner: true,
      admins: true,
      users: true,
    });
    if (this.isChannelAdmin(login, channel)) {
      this.removeChannelAdmin(login, channel);
    } else if (this.isChannelUser(login, channel)) {
      this.removeChannelUser(login, channel);
    }
  }

  private async removeChannelUser(login: string, channel: Channel) {
    channel.users = channel.users.filter((usr: User) => usr.login !== login);
    await this.channelRepository.save(channel);
  }

  private async removeChannelAdmin(login: string, channel: Channel) {
    channel.admins = channel.admins.filter((adm: User) => adm.login !== login);
    await this.channelRepository.save(channel);
  }

  private async administrateChannelUser(login: string, name: string) {
    const channel = await this.findChannelByName(name, {
      owner: true,
      admins: true,
      users: true,
    });
    if (this.isChannelAdmin(login, channel)) {
      await this.removeChannelAdmin(login, channel);
      await this.addChannelUser(login, channel);
    } else if (this.isChannelUser(login, channel)) {
      await this.removeChannelUser(login, channel);
      await this.addChannelAdmin(login, channel);
    }
  }

  private async findChannelSanctionByUserAndChannel(
    login: string,
    name: string,
  ) {
    const sanction = await this.sanctionRepository.findOne({
      where: {
        channel: { name: name },
        user: { login: login },
      },
      relations: {
        channel: true,
        user: true,
      },
    });
    return sanction;
  }

  private async findChannelSanctionByExpiredDate() {
    const targetDate = new Date(new Date().getTime() + 2 * 60 * 60 * 1000);
    const sanctions = await this.sanctionRepository.find({
      where: {
        timeout: LessThan(targetDate),
      },
      relations: {
        channel: true,
        user: true,
      },
    });
    return sanctions;
  }

  private async sanctionChannelUser(data: CreateSanctionDto) {
    await this.applySanctionDataSpecificChanges(data);
    await this.updateOrCreateSanction(data);
  }

  private async applySanctionDataSpecificChanges(data: CreateSanctionDto) {
    if (data.type === 'ban') {
      await this.removeChannelUserOrAdmin(data.userLogin, data.channelName);
    }
  }

  private async updateOrCreateSanction(data: CreateSanctionDto) {
    const sanction = await this.findChannelSanctionByUserAndChannel(
      data.userLogin,
      data.channelName,
    );
    if (sanction) {
      await this.updateSanction(sanction, data);
    } else {
      await this.createSanction(data);
    }
  }

  private async updateSanction(sanction: Sanction, data: CreateSanctionDto) {
    sanction.type = data.type;
    sanction.timeout = data.timeout;
    await this.sanctionRepository.save(sanction);
  }

  private async createSanction(data: CreateSanctionDto) {
    const sanction = this.sanctionRepository.create({
      ...data,
      channel: await this.findChannelByName(data.channelName),
      user: await this.userService.findByLogin(data.userLogin),
    });
    await this.sanctionRepository.save(sanction);
  }

  async removeExpiredSanctions(server: Server) {
    const expiredSanctions = await this.findChannelSanctionByExpiredDate();
    for (const sanction of expiredSanctions) {
      const removed = await this.sanctionRepository.remove(sanction);
      const user = await this.userService.findByLogin(removed.user.login);
      const channel = await this.findChannelByName(removed.channel.name, {
        owner: true,
        admins: true,
        users: true,
        chat: true,
      });
      const role = this.getChannelRole(user.login, channel);
      server
        .to(`channelDetails_${channel.name}`)
        .emit('removedSanction', this.userService.getPreview(user), role);
      server
        .to(removed.user.socketId)
        .emit('removedSanctionInChat', channel.chat.id);
    }
  }

  private validateOwnerPrivilege(login: string, channel: Channel) {
    if (!this.isChannelOwner(login, channel)) {
      throw new Error('not channel owner');
    }
  }

  private validateNonOwnerPrivilege(login: string, channel: Channel) {
    if (this.isChannelOwner(login, channel)) {
      throw new Error('cannot act on channel owner');
    }
  }

  private validateAdminPrivilege(login: string, channel: Channel) {
    if (!this.isChannelAdmin(login, channel)) {
      throw new Error('not a channel admin');
    }
  }

  private validateUserPrivilege(login: string, channel: Channel) {
    if (!this.isChannelUser(login, channel)) {
      throw new Error('not a channel user');
    }
  }

  private validateNonUserPrivilege(login: string, channel: Channel) {
    if (this.isChannelUser(login, channel)) {
      throw new Error('already a channel user');
    }
  }

  private validateNonMutedUserPrivilege(login: string, channel: Channel) {
    if (this.isMutedChannelUser(login, channel)) {
      throw new Error('user is muted in channel');
    }
  }

  private validateNonBannedUserPrivilege(login: string, channel: Channel) {
    if (this.isBannedChannelUser(login, channel)) {
      throw new Error('user is banned from channel');
    }
  }

  private validateChannelProtection(type: string, password: string) {
    if (type === 'protected' && password === null) {
      throw new Error('empty password for protected channel');
    } else if (type !== 'protected' && password !== null) {
      throw new Error('password for non-protected channel');
    }
  }

  private async validateJoiningRights(login: string, data: JoinChannelDto) {
    const channel = await this.findChannelByName(data.name, {
      owner: true,
      admins: true,
      users: true,
      sanctions: {
        user: true,
      },
    });
    this.validateNonUserPrivilege(login, channel);
    this.validateNonBannedUserPrivilege(login, channel);
    if (channel.type === 'private') {
      throw new Error('not allowed to join');
    }
    if (channel.type === 'protected' && !compareSync(data.password, channel.password)) {
      throw new Error('missing or invalid password');
    }
  }

  private async validateLeavingRights(login: string, data: LeaveChannelDto) {
    const channel = await this.findChannelByName(data.name, {
      owner: true,
      admins: true,
      users: true,
    });
    this.validateUserPrivilege(login, channel);
    this.validateNonOwnerPrivilege(login, channel);
  }

  private async validateAddingRights(
    login: string,
    data: AdministrateChannelDto,
  ) {
    const channel = await this.findChannelByName(data.channelName, {
      owner: true,
      admins: true,
      users: true,
      sanctions: {
        user: true,
      },
    });
    this.validateAdminPrivilege(login, channel);
    this.validateNonUserPrivilege(data.userLogin, channel);
    this.validateNonBannedUserPrivilege(data.userLogin, channel);
  }

  private async validateAdministratingRights(
    login: string,
    data: AdministrateChannelDto,
  ) {
    const channel = await this.findChannelByName(data.channelName, {
      owner: true,
      admins: true,
      users: true,
    });
    this.validateAdminPrivilege(login, channel);
    this.validateUserPrivilege(data.userLogin, channel);
    this.validateNonOwnerPrivilege(data.userLogin, channel);
  }

  validatePostingMessageRights(login: string, channel: Channel) {
    this.validateUserPrivilege(login, channel);
    this.validateNonMutedUserPrivilege(login, channel);
  }

  validateViewingMessageRights(login: string, channel: Channel) {
    this.validateUserPrivilege(login, channel);
  }

  // // testing
  // async getAllChannels() {
  //   const channels = await this.channelRepository.find({
  //     relations: ['owner'],
  //   });
  //   return channels;
  // }
}
