import { Module } from '@nestjs/common';
import { Gateway } from './gateway';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { ChatModule } from 'src/chat/chat.module';
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [ConfigModule, UserModule, ChatModule, GameModule],
  providers: [Gateway],
})
export class GatewayModule {}
