import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import ClientWithUser from '../authentication/interfaces/clientWithLogin.interface';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { HttpAndWsExceptionFilter } from 'src/exceptions/http-ws-exception.filter';
import CreateMessageDto from 'src/chat/dto/create-message.dto';
import UpdateUserDto from 'src/user/dto/update-user.dto';
import UpdateChannelDto from 'src/chat/dto/update-channel.dto';
import DeleteChannelDto from 'src/chat/dto/delete-channel.dto';
import UpdateMessageDto from 'src/chat/dto/update-message.dto';
import DeleteMessageDto from 'src/chat/dto/delete-message.dto';
import CreateSanctionDto from 'src/chat/dto/create-sanction.dto';
import JoinChannelDto from 'src/chat/dto/join-channel.dto';
import LeaveChannelDto from 'src/chat/dto/leave-channel.dto';
import AdministrateChannelDto from 'src/chat/dto/administrate-channel.dto';
import Channel from 'src/chat/entities/channel.entity';
import { ChannelService } from 'src/chat/channel.service';
import User from 'src/user/entities/user.entity';
import ManageChannelRoomDto from './dto/manage-channel-room.dto';
import ManageUserRoomDto from './dto/manage-user-room.dto';
import Chat from 'src/chat/entities/chat.entity';
import { ChatService } from 'src/chat/chat.service';
import ManageChatRoomDto from './dto/manage-chat-room.dto';
import { MessageService } from 'src/chat/message.service';
import Message from 'src/chat/entities/message.entity';
import { GameService } from 'src/game/game.service';
import { MatchmakingService } from 'src/game/matchmaking.service';
import StartGameDto from '../game/dto/start-game';
import UpdatePaddelPositionDto from 'src/game/dto/update-paddle-position.dto';
import ManageMatchRoomDto from './dto/manage-match-room.dto';
import ManageUserDto from 'src/user/dto/manage-user.dto';
import { FriendService } from 'src/user/friend.service';
import ManageLadderRoomDto from './dto/manage-ladder-room.dto';
import AcceptInviteDto from 'src/game/dto/accept-invite.dto';
import ManageInviteDto from 'src/game/dto/manage-invite.dto';
import { Player } from 'src/game/interfaces/game.interface';
import UploadAvatarDto from 'src/user/dto/upload-avatar.dto';
import { DirectService } from 'src/chat/direct.service';

@UsePipes(new ValidationPipe())
@UseFilters(HttpAndWsExceptionFilter)
@WebSocketGateway()
export class Gateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userService: UserService,
    private readonly friendService: FriendService,
    private readonly channelService: ChannelService,
    private readonly directService: DirectService,
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly gameService: GameService,
    private readonly matchmakingService: MatchmakingService,
  ) {
    setInterval(async () => {
      this.channelService.removeExpiredSanctions(this.server);
    }, 1000);
  }

  async handleConnection(client: ClientWithUser) {
    // console.log(client.id);
    const user = await this.userService.socketConnect(client.login, client.id);

    setTimeout(() => {
      this.server
        .to([`userPreview_${user.login}`, `userProfile_${user.login}`])
        .emit('userStatus', this.userService.getPreview(user));
    }, 500);
    // console.log('hi');
  }

  async handleDisconnect(client: ClientWithUser) {
    // console.log(client.id);
    const user = await this.userService.socketConnect(client.login, null);

    this.server
      .to([`userPreview_${user.login}`, `userProfile_${user.login}`])
      .emit('userStatus', this.userService.getPreview(user));
    // console.log('bye');
  }

  // @SubscribeMessage('message')
  // handleMessage(
  //   @ConnectedSocket() client: ClientWithUser,
  //   @MessageBody() message: string,
  // ): void {
  //   // Handle the incoming message
  //   console.log(client.id);
  //   console.log(`Received message from client: ${message}`);
  //   console.log(client.login);
  //   // Send a response back to the client
  //   const response = 'Server response';
  //   this.server.to(client.id).emit('response', response);
  // }

  // USER

  @SubscribeMessage('manageUserPreviewRoom')
  async handleManageUserPreviewRoom(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageUserRoomDto,
  ) {
    let user: User;
    try {
      user = await this.userService.findByLogin(body.userLogin);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    if (body.action === 'join') {
      client.join(`userPreview_${user.login}`);
    } else if (body.action === 'leave') {
      client.leave(`userPreview_${user.login}`);
    }
  }

  @SubscribeMessage('manageUserProfileRoom')
  async handleManageUserProfileRoom(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageUserRoomDto,
  ) {
    let user: User;
    try {
      user = await this.userService.findByLogin(body.userLogin);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    if (body.action === 'join') {
      client.join(`userProfile_${user.login}`);
    } else if (body.action === 'leave') {
      client.leave(`userProfile_${user.login}`);
    }
  }

  @SubscribeMessage('manageUserAvatarRoom')
  async handleManageUserAvatarRoom(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageUserRoomDto,
  ) {
    let user: User;
    try {
      user = await this.userService.findByLogin(body.userLogin);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    if (body.action === 'join') {
      client.join(`userAvatar_${user.login}`);
    } else if (body.action === 'leave') {
      client.leave(`userAvatar_${user.login}`);
    }
  }

  @SubscribeMessage('manageUserStatsRoom')
  async handleManageUserStatsRoom(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageUserRoomDto,
  ) {
    let user: User;
    try {
      user = await this.userService.findByLogin(body.userLogin);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    if (body.action === 'join') {
      client.join(`userStats_${user.login}`);
    } else if (body.action === 'leave') {
      client.leave(`userStats_${user.login}`);
    }
  }

  @SubscribeMessage('manageUserFriendsRoom')
  async handleManageUserFriendsRoom(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageUserRoomDto,
  ) {
    let user: User;
    try {
      user = await this.userService.findByLogin(body.userLogin);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    if (body.action === 'join') {
      client.join(`userFriends_${user.login}`);
    } else if (body.action === 'leave') {
      client.leave(`userFriends_${user.login}`);
    }
  }

  @SubscribeMessage('manageUserMatchHistoryRoom')
  async handleManageUserMatchHistoryRoom(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageUserRoomDto,
  ) {
    let user: User;
    try {
      user = await this.userService.findByLogin(body.userLogin);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    if (body.action === 'join') {
      client.join(`userMatchHistory_${user.login}`);
    } else if (body.action === 'leave') {
      client.leave(`userMatchHistory_${user.login}`);
    }
  }

  @SubscribeMessage('updateProfile')
  async handleUpdateProfile(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: UpdateUserDto,
  ) {
    const user = await this.userService.update(client.login, body);

    this.server
      .to(`userProfile_${user.login}`)
      .emit('updatedProfile', this.userService.getUpdate(user));
  }

  @SubscribeMessage('uploadAvatar')
  async handleUploadAvatar(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: UploadAvatarDto,
  ) {
    const dataURL = this.userService.imageToDataURL(body.data);
    await this.userService.setAvatar(client.login, dataURL);
    const user = await this.userService.findByLogin(client.login);

    this.server.to(`userAvatar_${user.login}`).emit('uploadedAvatar', dataURL);
  }

  // FRIEND

  @SubscribeMessage('addFriend')
  async handleAddFriend(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageUserDto,
  ) {
    let user: User;
    try {
      user = await this.userService.secureFindByLogin(body.login);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    try {
      await this.friendService.validateCreateRequest(client.login, user.login);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    await this.friendService.createFriendship(client.login, user.login);

    const self = await this.userService.findByLogin(client.login);
    this.server
      .to(self.socketId)
      .emit('sentFriendRequest', this.userService.getPreview(user));
    this.server
      .to(user.socketId)
      .emit('receivedFriendRequest', this.userService.getPreview(self));
    this.server
      .to(self.socketId)
      .emit('sentFriendRequestButton', this.userService.getPreview(user));
    this.server
      .to(user.socketId)
      .emit('receivedFriendRequestButton', this.userService.getPreview(self));
  }

  @SubscribeMessage('confirmFriend')
  async handleConfirmFriend(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageUserDto,
  ) {
    let user: User;
    try {
      user = await this.userService.secureFindByLogin(body.login);
      await this.friendService.secureFindFriendship(client.login, user.login);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    try {
      await this.friendService.validateConfirmRequest(client.login, user.login);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    await this.friendService.confirmFriendship(client.login, user.login);

    const self = await this.userService.findByLogin(client.login);
    if (!(await this.friendService.isBlocked(client.login, user.login))) {
      this.server
        .to(`userFriends_${client.login}`)
        .emit('newFriend', this.userService.getPreview(user));
    }
    if (!(await this.friendService.isBlocked(user.login, client.login))) {
      this.server
        .to(`userFriends_${user.login}`)
        .emit('newFriend', this.userService.getPreview(self));
    }
    this.server
      .to(self.socketId)
      .emit('newFriend', this.userService.getPreview(user));
    this.server
      .to(user.socketId)
      .emit('newFriend', this.userService.getPreview(self));
    this.server
      .to(self.socketId)
      .emit('newFriendButton', this.userService.getPreview(user));
    this.server
      .to(user.socketId)
      .emit('newFriendButton', this.userService.getPreview(self));
  }

  @SubscribeMessage('removeFriend')
  async handleRemoveFriend(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageUserDto,
  ) {
    let user: User;
    try {
      user = await this.userService.secureFindByLogin(body.login);
      await this.friendService.secureFindFriendship(client.login, user.login);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    await this.friendService.removeFriendship(client.login, user.login);

    const self = await this.userService.findByLogin(client.login);
    if (!(await this.friendService.isBlocked(client.login, user.login))) {
      this.server
        .to(`userFriends_${client.login}`)
        .emit('removedFriend', this.userService.getPreview(user));
    }
    if (!(await this.friendService.isBlocked(user.login, client.login))) {
      this.server
        .to(`userFriends_${user.login}`)
        .emit('removedFriend', this.userService.getPreview(self));
    }
    this.server
      .to(self.socketId)
      .emit('removedFriend', this.userService.getPreview(user));
    this.server
      .to(user.socketId)
      .emit('removedFriend', this.userService.getPreview(self));
    this.server
      .to(self.socketId)
      .emit('removedFriendButton', this.userService.getPreview(user));
    this.server
      .to(user.socketId)
      .emit('removedFriendButton', this.userService.getPreview(self));
  }

  @SubscribeMessage('blockUser')
  async handleBlockUser(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageUserDto,
  ) {
    let user: User;
    try {
      user = await this.userService.secureFindByLogin(body.login);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    try {
      this.friendService.validateBlocking(client.login, user.login);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    await this.friendService.blockUser(client.login, user.login);

    const self = await this.userService.findByLogin(client.login);
    if (await this.friendService.isFriend(client.login, user.login)) {
      this.server
        .to(`userFriends_${client.login}`)
        .emit('removedFriend', this.userService.getPreview(user));
    }
    this.server
      .to(self.socketId)
      .emit('blockedUser', this.userService.getPreview(user));
    this.server
      .to(self.socketId)
      .emit('blockedUserButton', this.userService.getPreview(user));
  }

  @SubscribeMessage('unblockUser')
  async handleUnblockUser(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageUserDto,
  ) {
    let user: User;
    try {
      user = await this.userService.secureFindByLogin(body.login);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    try {
      this.friendService.validateUnblocking(client.login, user.login);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    await this.friendService.unblockUser(client.login, user.login);

    const self = await this.userService.findByLogin(client.login);
    if (await this.friendService.isFriend(client.login, user.login)) {
      this.server
        .to(`userFriends_${client.login}`)
        .emit('newFriend', this.userService.getPreview(user));
    }
    if (await this.friendService.isPending(client.login, user.login)) {
      if (await this.friendService.isReceiving(client.login, user.login)) {
        this.server
          .to(self.socketId)
          .emit('receivedFriendRequest', this.userService.getPreview(user));
      } else if (
        await this.friendService.isReceiving(user.login, client.login)
      ) {
        this.server
          .to(self.socketId)
          .emit('sentFriendRequest', this.userService.getPreview(user));
      }
    }
    this.server
      .to(self.socketId)
      .emit('unblockedUser', this.userService.getPreview(user));
    this.server
      .to(self.socketId)
      .emit('unblockedUserButton', this.userService.getPreview(user));
  }

  // CHANNEL

  @SubscribeMessage('manageChannelPreviewRoom')
  async handleManageChannelPreviewRoom(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageChannelRoomDto,
  ) {
    let channel: Channel;
    try {
      channel = await this.channelService.secureFindChannelByName(
        body.channelName,
      );
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    if (body.action === 'join') {
      client.join(`channelPreview_${channel.name}`);
    } else if (body.action === 'leave') {
      client.leave(`channelPreview_${channel.name}`);
    }
  }

  @SubscribeMessage('manageChannelDetailsRoom')
  async handleManageChannelDetailsRoom(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageChannelRoomDto,
  ) {
    let channel: Channel;
    try {
      channel = await this.channelService.secureFindChannelByName(
        body.channelName,
      );
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    try {
      await this.channelService.validateViewChannelDetails(
        client.login,
        channel.name,
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    if (body.action === 'join') {
      client.join(`channelDetails_${channel.name}`);
    } else if (body.action === 'leave') {
      client.leave(`channelDetails_${channel.name}`);
    }
  }

  @SubscribeMessage('updateChannel')
  async handleUpdateChannel(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: UpdateChannelDto,
  ) {
    let channel: Channel;
    try {
      channel = await this.channelService.secureFindChannelByName(body.name);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
    try {
      await this.channelService.validateUpdateChannelData(body);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    try {
      channel = await this.channelService.updateChannel(client.login, body);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    this.server
      .to([`channelPreview_${channel.name}`, `channelDetails_${channel.name}`])
      .emit('updatedChannel', this.channelService.getChannelPreview(channel));
  }

  @SubscribeMessage('deleteChannel')
  async handleDeleteChannel(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: DeleteChannelDto,
  ) {
    let channel: Channel;
    try {
      channel = await this.channelService.secureFindChannelByName(body.name);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    try {
      channel = await this.channelService.deleteChannel(client.login, body);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    this.server
      .to([
        `channelPreview_${channel.name}`,
        `channelDetails_${channel.name}`,
        `chat_${channel.chat.id}`,
      ])
      .emit('deletedChannel', this.channelService.getChannelPreview(channel));
  }

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: JoinChannelDto,
  ) {
    let channel: Channel;
    try {
      channel = await this.channelService.secureFindChannelByName(body.name);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    try {
      await this.channelService.joinChannel(client.login, body);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
    const user = await this.userService.findByLogin(client.login);

    this.server
      .to(`channelDetails_${channel.name}`)
      .emit('newUser', this.userService.getPreview(user));
    this.server
      .to(user.socketId)
      .emit('joinedChannel', this.channelService.getChannelPreview(channel));
  }

  @SubscribeMessage('leaveChannel')
  async handleLeaveChannel(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: LeaveChannelDto,
  ) {
    let channel: Channel;
    try {
      channel = await this.channelService.secureFindChannelByName(body.name);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    try {
      await this.channelService.leaveChannel(client.login, body);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
    const user = await this.userService.findByLogin(client.login);

    this.server
      .to(`channelDetails_${channel.name}`)
      .emit('removedUser', this.userService.getPreview(user));
    this.server
      .to(user.socketId)
      .emit('deletedChannel', this.channelService.getChannelPreview(channel));
  }

  @SubscribeMessage('addToChannel')
  async handleAddToChannel(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: AdministrateChannelDto,
  ) {
    let channel: Channel;
    let user: User;
    try {
      channel = await this.channelService.secureFindChannelByName(
        body.channelName,
      );
      user = await this.userService.secureFindByLogin(body.userLogin);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    try {
      await this.channelService.addToChannel(client.login, body);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    this.server
      .to(`channelDetails_${channel.name}`)
      .emit('newUser', this.userService.getPreview(user));
    this.server
      .to(user.socketId)
      .emit('joinedChannel', this.channelService.getChannelPreview(channel));
  }

  @SubscribeMessage('kickFromChannel')
  async handleKickFromChannel(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: AdministrateChannelDto,
  ) {
    let channel: Channel;
    let user: User;
    try {
      channel = await this.channelService.secureFindChannelByName(
        body.channelName,
      );
      user = await this.userService.secureFindByLogin(body.userLogin);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    try {
      await this.channelService.kickFromChannel(client.login, body);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    this.server
      .to(`channelDetails_${channel.name}`)
      .emit('removedUser', this.userService.getPreview(user));
    this.server
      .to(user.socketId)
      .emit('deletedChannel', this.channelService.getChannelPreview(channel));
  }

  @SubscribeMessage('sanctionForChannel')
  async handleSanctionForChannel(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: CreateSanctionDto,
  ) {
    let channel: Channel;
    let user: User;
    try {
      channel = await this.channelService.secureFindChannelByName(
        body.channelName,
      );
      user = await this.userService.secureFindByLogin(body.userLogin);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    try {
      await this.channelService.sanctionForChannel(client.login, body);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    if (body.type === 'mute') {
      this.server
        .to(`channelDetails_${channel.name}`)
        .emit('mutedUser', this.userService.getPreview(user));
      this.server.to(user.socketId).emit('mutedInChat', channel.chat.id);
    } else if (body.type === 'ban') {
      this.server
        .to(`channelDetails_${channel.name}`)
        .emit('bannedUser', this.userService.getPreview(user));
      this.server
        .to(user.socketId)
        .emit('deletedChannel', this.channelService.getChannelPreview(channel));
    }
  }

  @SubscribeMessage('administrateForChannel')
  async handleAdministrateForChannel(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: AdministrateChannelDto,
  ) {
    let channel: Channel;
    let user: User;
    try {
      channel = await this.channelService.secureFindChannelByName(
        body.channelName,
      );
      user = await this.userService.secureFindByLogin(body.userLogin);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    try {
      await this.channelService.administrateForChannel(client.login, body);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    channel = await this.channelService.findChannelByName(channel.name, {
      owner: true,
      admins: true,
      users: true,
    });
    if (this.channelService.isChannelAdmin(user.login, channel)) {
      this.server
        .to(`channelDetails_${channel.name}`)
        .emit('promotedUser', this.userService.getPreview(user));
      this.server
        .to(user.socketId)
        .emit(
          'promotedInChannel',
          this.channelService.getChannelPreview(channel),
        );
    } else if (this.channelService.isChannelUser(user.login, channel)) {
      this.server
        .to(`channelDetails_${channel.name}`)
        .emit('demotedUser', this.userService.getPreview(user));
      this.server
        .to(user.socketId)
        .emit(
          'demotedInChannel',
          this.channelService.getChannelPreview(channel),
        );
    }
  }

  // DIRECT

  @SubscribeMessage('showDirect')
  async handleShowDirect(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageUserDto,
  ) {
    let user: User;
    try {
      user = await this.userService.secureFindByLogin(body.login);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    const direct = await this.directService.showDirect(
      client.login,
      user.login,
    );

    const self = await this.userService.findByLogin(client.login);
    this.server
      .to(self.socketId)
      .emit('shownDirect', this.directService.getDirectPreview(user, direct));
    this.server
      .to(user.socketId)
      .emit('shownDirect', this.directService.getDirectPreview(self, direct));
  }

  @SubscribeMessage('hideDirect')
  async handleHideDirect(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageUserDto,
  ) {
    let user: User;
    try {
      user = await this.userService.secureFindByLogin(body.login);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    const direct = await this.directService.hideDirect(
      client.login,
      user.login,
    );

    const self = await this.userService.findByLogin(client.login);
    this.server
      .to(self.socketId)
      .emit('hiddenDirect', this.directService.getDirectPreview(user, direct));
    this.server
      .to(user.socketId)
      .emit('hiddenDirect', this.directService.getDirectPreview(self, direct));
  }

  // MESSAGE

  @SubscribeMessage('manageChatRoom')
  async handleManageChatRoom(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageChatRoomDto,
  ) {
    let chat: Chat;
    try {
      chat = await this.chatService.secureFindById(body.chatId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    try {
      await this.chatService.validateViewChatMessages(client.login, chat.id);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    if (body.action === 'join') {
      client.join(`chat_${chat.id}`);
    } else if (body.action === 'leave') {
      client.leave(`chat_${chat.id}`);
    }
  }

  @SubscribeMessage('postMessage')
  async handlePostMessage(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: CreateMessageDto,
  ) {
    let chat: Chat;
    try {
      chat = await this.chatService.secureFindById(body.chatId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
    chat = await this.chatService.findById(chat.id, {
      channel: true,
      direct: true,
    });

    if (this.chatService.isChannelType(chat.channel)) {
      try {
        const channel = await this.channelService.findChannelByName(
          chat.channel.name,
          {
            owner: true,
            admins: true,
            users: true,
            sanctions: {
              user: true,
            },
          },
        );
        this.channelService.validatePostingMessageRights(client.login, channel);
      } catch (error) {
        throw new ForbiddenException(error.message);
      }
    }
    const message = await this.chatService.postMessage(client.login, body);

    const room = this.server.sockets.adapter.rooms.get(`chat_${chat.id}`);
    const sockets = Array.from(room || []);
    const event = 'newMessage';
    const payload = await this.messageService.getMessageDetails(message.id);

    await this.userService.sendEventToNonBlockedRoomMembers(
      client.login,
      this.server,
      event,
      payload,
      sockets,
    );
  }

  @SubscribeMessage('updateMessage')
  async handleUpdateMessage(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: UpdateMessageDto,
  ) {
    let message: Message;
    try {
      message = await this.messageService.secureFindById(body.id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    try {
      message = await this.messageService.updateMessage(client.login, body);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    const room = this.server.sockets.adapter.rooms.get(
      `chat_${message.chat.id}`,
    );
    const sockets = Array.from(room || []);
    const event = 'updatedMessage';
    const payload = await this.messageService.getMessageDetails(body.id);

    await this.userService.sendEventToNonBlockedRoomMembers(
      client.login,
      this.server,
      event,
      payload,
      sockets,
    );
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: DeleteMessageDto,
  ) {
    let message: Message;
    try {
      message = await this.messageService.secureFindById(body.id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    try {
      message = await this.messageService.deleteMessage(client.login, body);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    const room = this.server.sockets.adapter.rooms.get(
      `chat_${message.chat.id}`,
    );
    const sockets = Array.from(room || []);
    const event = 'deletedMessage';
    const payload = await this.messageService.getMessageDetails(body.id);

    await this.userService.sendEventToNonBlockedRoomMembers(
      client.login,
      this.server,
      event,
      payload,
      sockets,
    );
  }

  @SubscribeMessage('sendInvite')
  async handleSendInvite(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageInviteDto,
  ) {
    let chat: Chat;
    try {
      chat = await this.chatService.secureFindById(body.chatId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
    chat = await this.chatService.findById(chat.id, {
      channel: true,
      direct: true,
    });

    try {
      if (this.chatService.isChannelType(chat.channel)) {
        const channel = await this.channelService.findChannelByName(
          chat.channel.name,
          {
            owner: true,
            admins: true,
            users: true,
            sanctions: {
              user: true,
            },
          },
        );
        this.channelService.validatePostingMessageRights(client.login, channel);
      }
      this.matchmakingService.joinInviteList(client.login);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    const user = await this.userService.findByLogin(client.login);
    const room = this.server.sockets.adapter.rooms.get(`chat_${chat.id}`);
    const sockets = Array.from(room || []);
    const event = 'inviteToPlay';
    const payload = this.userService.getPreview(user);

    await this.userService.sendEventToNonBlockedRoomMembers(
      client.login,
      this.server,
      event,
      payload,
      sockets,
    );
  }

  @SubscribeMessage('cancelInvite')
  async handleCancelInvite(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageInviteDto,
  ) {
    let chat: Chat;
    try {
      chat = await this.chatService.secureFindById(body.chatId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
    try {
      this.matchmakingService.leaveInviteList(client.login);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    const user = await this.userService.findByLogin(client.login);
    const room = this.server.sockets.adapter.rooms.get(`chat_${chat.id}`);
    const sockets = Array.from(room || []);
    const event = 'canceledInvite';
    const payload = this.userService.getPreview(user);

    await this.userService.sendEventToNonBlockedRoomMembers(
      client.login,
      this.server,
      event,
      payload,
      sockets,
    );
  }

  @SubscribeMessage('acceptInvite')
  async handleAcceptInvite(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: AcceptInviteDto,
  ) {
    let chat: Chat;
    let user: User;
    try {
      chat = await this.chatService.secureFindById(body.chatId);
      user = await this.userService.secureFindByLogin(body.userLogin);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
    chat = await this.chatService.findById(chat.id, {
      channel: true,
      direct: true,
    });

    let player: Player;
    try {
      if (this.chatService.isChannelType(chat.channel)) {
        const channel = await this.channelService.findChannelByName(
          chat.channel.name,
          {
            owner: true,
            admins: true,
            users: true,
            sanctions: {
              user: true,
            },
          },
        );
        this.channelService.validatePostingMessageRights(client.login, channel);
      }
      player = this.matchmakingService.acceptInvite(client.login, user.login);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
    this.gameService.joinMatchRoom(this.server, player);

    const self = await this.userService.findByLogin(client.login);
    const room = this.server.sockets.adapter.rooms.get(`chat_${chat.id}`);
    const sockets = Array.from(room || []);
    const event = 'acceptedInvite';
    const payload = this.userService.getPreview(self);

    await this.userService.sendEventToNonBlockedRoomMembers(
      client.login,
      this.server,
      event,
      payload,
      sockets,
    );
  }

  // GAME

  @SubscribeMessage('manageLadderRoom')
  async handleManageLadderRoom(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageLadderRoomDto,
  ) {
    if (body.action === 'join') {
      client.join('ladder');
    } else if (body.action === 'leave') {
      client.leave('ladder');
    }
  }

  @SubscribeMessage('manageMatchRoom')
  async handleManageMatchRoom(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: ManageMatchRoomDto,
  ) {
    try {
      this.gameService.validateGameSession(body.matchId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    if (body.action === 'join') {
      client.join(`match_${body.matchId}`);
    } else if (body.action === 'leave') {
      client.leave(`match_${body.matchId}`);
    }
  }

  @SubscribeMessage('joinMatchmaking')
  async handleJoinMatchmaking(@ConnectedSocket() client: ClientWithUser) {
    try {
      this.matchmakingService.joinQueue(client.login);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
    const player = this.matchmakingService.matchPlayers();

    if (player) {
      await this.gameService.joinMatchRoom(this.server, player);
    }
  }

  @SubscribeMessage('leaveMatchmaking')
  async handleLeaveMatchmaking(@ConnectedSocket() client: ClientWithUser) {
    try {
      this.matchmakingService.leaveQueue(client.login);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }

  @SubscribeMessage('startGame')
  async handleStartGame(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: StartGameDto,
  ) {
    try {
      this.gameService.validateGameSession(body.id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
    try {
      this.gameService.validatePlayer(client.login, body.id);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    await this.gameService.startGame(body.id);
  }

  @SubscribeMessage('updatePaddlePosition')
  handleUpdatePaddlePosition(
    @ConnectedSocket() client: ClientWithUser,
    @MessageBody() body: UpdatePaddelPositionDto,
  ) {
    try {
      this.gameService.validateGameSession(body.matchId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
    try {
      this.gameService.validatePlayer(client.login, body.matchId);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    this.gameService.updatePaddlePosition(client.login, body);
  }
}
