import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Chat from './entities/chat.entity';
import { Repository } from 'typeorm';
import Message from './entities/message.entity';
import { MessageService } from './message.service';
import User from 'src/user/entities/user.entity';
import CreateMessageDto from './dto/create-message.dto';
import { ChannelService } from './channel.service';
import { DirectService } from './direct.service';
import Channel from './entities/channel.entity';
import Direct from './entities/direct.entity';
import { MessageChat } from './interfaces/chat.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService,
    @Inject(forwardRef(() => ChannelService))
    private readonly channelService: ChannelService,
    @Inject(forwardRef(() => DirectService))
    private readonly directService: DirectService,
    private readonly userService: UserService,
  ) {}

  createChat(type: Channel | Direct) {
    let chat: Chat;
    if (type instanceof Channel) {
      chat = this.chatRepository.create({
        channel: type,
      });
    } else if (type instanceof Direct) {
      chat = this.chatRepository.create({
        direct: type,
      });
    }
    return chat;
  }

  async postMessage(login: string, data: CreateMessageDto) {
    const message = await this.messageService.createMessage(login, data);
    return message;
  }

  async getMessageChat(login: string, id: string) {
    let role: 'user' | 'muted' = 'user';
    const messages = await this.getMessageDetailsByChat(login, id);
    const chat = await this.findById(id, {
      channel: {
        sanctions: {
          user: true,
        },
      },
    });
    if (
      this.isChannelType(chat.channel) &&
      this.channelService.isMutedChannelUser(login, chat.channel)
    ) {
      role = 'muted';
    }
    const messageChat: MessageChat = {
      role: role,
      messages: messages,
    };
    return messageChat;
  }

  async getMessageDetailsByChat(login: string, id: string) {
    const user = await this.userService.findByLogin(login, {
      blocked: true,
    });
    const chat = await this.findById(id, {
      messages: {
        author: true,
      },
    });
    const messages = await Promise.all(
      this.filterBlocked(chat.messages, user.blocked).map(
        async (message: Message) => {
          const messageDetails = await this.messageService.getMessageDetails(
            message.id,
          );
          return messageDetails;
        },
      ),
    );
    return messages;
  }

  private filterBlocked(messages: Message[], blocked: User[]) {
    return messages?.filter(
      (message: Message) =>
        !blocked?.some((block: User) => block.login === message.author.login),
    );
  }

  async validateViewChatMessages(login: string, id: string) {
    const chat = await this.findById(id, {
      channel: {
        owner: true,
        admins: true,
        users: true,
      },
      direct: {
        users: true,
      },
    });
    if (this.isChannelType(chat.channel)) {
      this.channelService.validateViewingMessageRights(login, chat.channel);
    } else if (this.isDirectType(chat.direct)) {
      this.directService.validateUserPrivilege(login, chat.direct);
    }
  }

  isChannelType(channel: Channel) {
    return channel !== null;
  }

  isDirectType(direct: Direct) {
    return direct !== null;
  }

  async secureFindById(id: string) {
    const chat = await this.findById(id);
    if (!chat) {
      throw new Error('bad chat id');
    }
    return chat;
  }

  async findById(id: string, relations?: any) {
    let params: any;
    if (relations) {
      params = {
        where: {
          id: id,
        },
        relations: relations,
      };
    } else {
      params = {
        where: {
          id: id,
        },
      };
    }
    const chat = await this.chatRepository.findOne(params);
    return chat;
  }
}
