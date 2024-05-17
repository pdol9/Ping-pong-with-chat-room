import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import Channel from './entities/channel.entity';
import Direct from './entities/direct.entity';
import Message from './entities/message.entity';
import { ChatController } from './chat.controller';
import { ChannelService } from './channel.service';
import { UserModule } from 'src/user/user.module';
import { DirectService } from './direct.service';
import Sanction from './entities/sanction.entity';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import Chat from './entities/chat.entity';
import { MessageService } from './message.service';
import { ChatService } from './chat.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, Direct, Chat, Message, Sanction]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
    AuthenticationModule,
    UserModule,
  ],
  controllers: [ChatController],
  providers: [ChannelService, DirectService, ChatService, MessageService],
  exports: [ChannelService, DirectService, ChatService, MessageService],
})
export class ChatModule {}
