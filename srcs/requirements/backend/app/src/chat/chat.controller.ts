import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import CreateChannelDto from './dto/create-channel.dto';
import RequestWithLogin from 'src/authentication/interfaces/requestWithLogin.interface';
import { AuthGuard } from 'src/authentication/auth.guard';
import Channel from './entities/channel.entity';
import Direct from './entities/direct.entity';
import ChannelParamDto from './dto/request-channel.dto';
import { UserService } from 'src/user/user.service';
import UserParamDto from 'src/user/dto/request-user.dto';
import { DirectService } from './direct.service';
import User from 'src/user/entities/user.entity';
import { ChatService } from './chat.service';
import ChatParamDto from './dto/request-chat.dto';
import { AllChats } from './interfaces/chat.interface';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly directService: DirectService,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('all')
  async getAllUserChats(@Req() request: RequestWithLogin) {
    const allChats: AllChats = {
      channels: await this.channelService.getAllUserChannels(request.login),
      directs: await this.directService.getAllUserDirects(request.login),
    };
    return allChats;
  }

  // channels
  @UseGuards(AuthGuard)
  @Post('channel/create')
  async createChannel(
    @Body() body: CreateChannelDto,
    @Req() request: RequestWithLogin,
  ) {
    try {
      await this.channelService.validateChannelCreation(body);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    const channel = await this.channelService.createChannel(
      request.login,
      body,
    );
    return this.channelService.getChannelPreview(channel);
  }

  @UseGuards(AuthGuard)
  @Get('channel/:name/preview')
  async getChannelPreview(@Param() { name }: ChannelParamDto) {
    let channel: Channel;
    try {
      channel = await this.channelService.secureFindChannelByName(name);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    return this.channelService.getChannelPreview(channel);
  }

  @UseGuards(AuthGuard)
  @Get('channel/:name/details')
  async getChannelDetails(
    @Param() { name }: ChannelParamDto,
    @Req() request: RequestWithLogin,
  ) {
    try {
      await this.channelService.secureFindChannelByName(name);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    try {
      await this.channelService.validateViewChannelDetails(request.login, name);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    return await this.channelService.getChannelDetails(request.login, name);
  }

  // @UseGuards(AuthGuard)
  // @Patch('channel/:name/update')
  // async updateChannel(
  //   @Param() { name }: ChannelParamDto,
  //   @Body() body: UpdateChannelDto,
  //   @Req() request: RequestWithLogin,
  // ) {
  //   let channel: Channel;
  //   try {
  //     channel = await this.channelService.secureFindChannelByName(name);
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }
  //   try {
  //     await this.channelService.validateUpdateChannelData(channel, body);
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }

  //   try {
  //     channel = await this.channelService.updateChannel(request.user, channel, body);
  //   } catch (error) {
  //     throw new ForbiddenException(error.message);
  //   }

  //   return this.channelService.getChannelPreview(channel);
  // }

  // @UseGuards(AuthGuard)
  // @Delete('channel/:name/delete')
  // async deleteChannel(@Param() { name }: ChannelParamDto, @Req() request: RequestWithLogin) {
  //   let channel: Channel;
  //   try {
  //     channel = await this.channelService.secureFindChannelByName(name);
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }

  //   try {
  //     channel = await this.channelService.deleteChannel(request.user, channel);
  //   } catch (error) {
  //     throw new ForbiddenException(error.message);
  //   }

  //   return this.channelService.getChannelPreview(channel);
  // }

  // // @UseGuards(AuthGuard)
  // @Post('channel/:name/join/:user')
  // async joinChannel(
  //   @Param('name') name: string, @Param('user') login: string,
  //   // @Param() { name }: ChannelParamDto,
  //   @Body() body: JoinChannelDto,
  //   // @Req() request: RequestWithLogin,
  // ) {
  //   const user = await this.userService.findByLogin(login);
  //   let channel: Channel;
  //   try {
  //     channel = await this.channelService.secureFindChannelByName(name);
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }

  //   try {
  //     channel = await this.channelService.joinChannel(user, channel, body);
  //   } catch (error) {
  //     throw new ForbiddenException(error.message);
  //   }

  //   return this.channelService.getChannelPreview(channel);
  // }

  // // @UseGuards(AuthGuard)
  // @Delete('channel/:name/leave/:user')
  // async leaveChannel(
  //   @Param('name') name: string, @Param('user') login: string,
  //   // @Param() { name }: ChannelParamDto,
  //   // @Req() request: RequestWithLogin,
  // ) {
  //   const user = await this.userService.findByLogin(login);
  //   let channel: Channel;
  //   try {
  //     channel = await this.channelService.secureFindChannelByName(name);
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }

  //   try {
  //     channel = await this.channelService.leaveChannel(user, channel);
  //   } catch (error) {
  //     throw new ForbiddenException(error.message);
  //   }

  //   return this.channelService.getChannelPreview(channel);
  // }

  // @UseGuards(AuthGuard)
  // @Post('channel/:name/add/:login')
  // async addToChannel(
  //   @Param() { name, login }: NameUserParamDto,
  //   @Req() request: RequestWithLogin,
  // ) {
  //   let channel: Channel;
  //   let user: User;
  //   try {
  //     channel = await this.channelService.secureFindChannelByName(name);
  //     user = await this.userService.secureFindByLogin(login);
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }

  //   try {
  //     channel = await this.channelService.addToChannel(request.user, user, channel);
  //   } catch (error) {
  //     throw new ForbiddenException(error.message);
  //   }

  //   return this.channelService.getChannelPreview(channel);
  // }

  // @UseGuards(AuthGuard)
  // @Delete('channel/:name/kick/:login')
  // async kickFromChannel(
  //   @Param() { name, login }: NameUserParamDto,
  //   @Req() request: RequestWithLogin,
  // ) {
  //   let channel: Channel;
  //   let user: User;
  //   try {
  //     channel = await this.channelService.secureFindChannelByName(name);
  //     user = await this.userService.secureFindByLogin(login);
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }

  //   try {
  //     channel = await this.channelService.kickFromChannel(request.user, user, channel);
  //   } catch (error) {
  //     throw new ForbiddenException(error.message);
  //   }

  //   return this.channelService.getChannelPreview(channel);
  // }

  // @UseGuards(AuthGuard)
  // @Post('channel/:name/sanction/:login')
  // async sanctionForChannel(
  //   @Param() { name, login }: NameUserParamDto,
  //   @Body() body: CreateSanctionDto,
  //   @Req() request: RequestWithLogin,
  // ) {
  //   let channel: Channel;
  //   let user: User;
  //   try {
  //     channel = await this.channelService.secureFindChannelByName(name);
  //     user = await this.userService.secureFindByLogin(login);
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }

  //   try {
  //     channel = await this.channelService.sanctionForChannel(request.user, user, channel, body);
  //   } catch (error) {
  //     throw new ForbiddenException(error.message);
  //   }

  //   return this.channelService.getChannelPreview(channel);
  // }

  // @UseGuards(AuthGuard)
  // @Post('channel/:name/administrate/:login')
  // async administrateForChannel(
  //   @Param() { name, login }: NameUserParamDto,
  //   @Req() request: RequestWithLogin,
  // ) {
  //   let channel: Channel;
  //   let user: User;
  //   try {
  //     channel = await this.channelService.secureFindChannelByName(name);
  //     user = await this.userService.secureFindByLogin(login);
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }

  //   try {
  //     channel = await this.channelService.administrateForChannel(request.user, user, channel);
  //   } catch (error) {
  //     throw new ForbiddenException(error.message);
  //   }
  //   return this.channelService.getChannelPreview(channel);
  // }

  // direct chats
  @UseGuards(AuthGuard)
  @Get(':login/preview')
  async getDirectPreview(
    @Param() { login }: UserParamDto,
    @Req() request: RequestWithLogin,
  ) {
    let user: User;
    let direct: Direct;
    try {
      user = await this.userService.secureFindByLogin(login);
      direct = await this.directService.secureFindDirectByUsers(
        request.login,
        user.login,
      );
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    direct = await this.directService.findDirectByUsers(
      request.login,
      user.login,
    );
    return this.directService.getDirectPreview(user, direct);
  }

  @UseGuards(AuthGuard)
  @Get(':login/details')
  async getDirectDetails(
    @Param() { login }: UserParamDto,
    @Req() request: RequestWithLogin,
  ) {
    let user: User;
    try {
      user = await this.userService.secureFindByLogin(login);
      await this.directService.secureFindDirectByUsers(
        request.login,
        user.login,
      );
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    return await this.directService.getDirectDetails(request.login, user.login);
  }

  // @UseGuards(AuthGuard)
  // @Post(':login/show')
  // async showDirect(@Param() { login }: UserParamDto, @Req() request: RequestWithLogin) {
  //   let user: User;
  //   try {
  //     user = await this.userService.secureFindByLogin(login);
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }

  //   const direct = await this.directService.showDirect(request.user, user);
  //   return this.directService.getDirectPreview(user, direct);
  // }

  // @UseGuards(AuthGuard)
  // @Post(':login/hide')
  // async hideDirect(@Param() { login }: UserParamDto, @Req() request: RequestWithLogin) {
  //   let user: User;
  //   try {
  //     user = await this.userService.secureFindByLogin(login);
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }

  //   const direct = await this.directService.hideDirect(request.user, user);
  //   return this.directService.getDirectPreview(user, direct);
  // }

  // chat

  @UseGuards(AuthGuard)
  @Get(':id/messages')
  async getChatMessages(
    @Param() { id }: ChatParamDto,
    @Req() request: RequestWithLogin,
  ) {
    try {
      await this.chatService.secureFindById(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    try {
      await this.chatService.validateViewChatMessages(request.login, id);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    return await this.chatService.getMessageChat(request.login, id);
  }

  // message CRUD
  // channel message
  // @Post('channel/:name/message/send')
  // async createChannelMessage() {

  // }

  // @Get('channel/:name/message/:id/preview')
  // async getChannelMessagePreview() {

  // }

  // @Get('channel/:name/message/:id/details')
  // async getChannelMessageDetails() {

  // }

  // direct message
  // @Post(':login/message/send')
  // async createDirectMessage() {

  // }

  // @Get(':login/message/:id/preview')
  // async getDirectMessagePreview() {

  // }

  // @Get(':login/message/:id/details')
  // async getDirectMessageDetails() {

  // }

  // modify message
  // @Patch('message/:id/update')
  // async updateMessage() {

  // }

  // @Delete('message/:id/delete')
  // async deleteMessage() {

  // }

  // testing
  // @Get('channels')
  // async getAllChannels(): Promise<Channel[]> {
  //   const channels = await this.channelService.getAllChannels();
  //   return channels;
  // }

  // @Get('directs')
  // async getAllDirects(): Promise<Direct[]> {
  //   const channels = await this.directService.getAllDirects();
  //   return channels;
  // }

  // @Get('messages')
  // async getAllMessages(): Promise<Message[]> {
  //   const channels = await this.channelService.getAllMessages();
  //   return channels;
  // }
}
