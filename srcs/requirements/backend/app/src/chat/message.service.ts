import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Message from './entities/message.entity';
import { Repository } from 'typeorm';
import CreateMessageDto from './dto/create-message.dto';
import { MessageDetails } from './interfaces/message.interface';
import UpdateMessageDto from './dto/update-message.dto';
import { UserService } from 'src/user/user.service';
import { ChatService } from './chat.service';
import DeleteMessageDto from './dto/delete-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  async createMessage(login: string, data: CreateMessageDto) {
    const message = this.messageRepository.create({
      ...data,
      author: await this.userService.findByLogin(login),
      chat: await this.chatService.findById(data.chatId),
    });
    await this.messageRepository.save(message);
    return message;
  }

  async updateMessage(login: string, data: UpdateMessageDto) {
    const message = await this.findById(data.id, {
      author: true,
    });
    this.validateAuthorPrivilege(login, message);
    const updated = await this.messageRepository.save({ ...message, ...data });
    return updated;
  }

  async deleteMessage(login: string, data: DeleteMessageDto) {
    const message = await this.findById(data.id, {
      author: true,
    });
    this.validateAuthorPrivilege(login, message);
    const deleted = await this.messageRepository.remove(message);
    return deleted;
  }

  validateAuthorPrivilege(login: string, message: Message) {
    if (!this.isAuthor(login, message)) {
      throw new Error('not message author');
    }
  }

  async getMessageDetails(id: string) {
    const message = await this.findById(id, {
      author: true,
    });
    const messageDetails: MessageDetails = {
      id: message.id,
      author: this.userService.getPreview(message.author),
      content: message.content,
      created_at: message.created_at,
      updated_at: message.updated_at,
      deleted_at: message.deleted_at,
    };
    return messageDetails;
  }

  async secureFindById(id: string) {
    const message = await this.findById(id);
    if (!message) {
      throw new Error('bad message id');
    }
    return message;
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
    const message = await this.messageRepository.findOne(params);
    return message;
  }

  private isAuthor(login: string, message: Message) {
    return login === message.author.login;
  }
}
