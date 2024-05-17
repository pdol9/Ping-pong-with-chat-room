import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { config } from './config/config';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { APP_FILTER } from '@nestjs/core';
import { GatewayModule } from './gateway/gateway.module';
import { HttpAndWsExceptionFilter } from './exceptions/http-ws-exception.filter';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
    DatabaseModule,
    GatewayModule,
    AuthenticationModule,
    UserModule,
    ChatModule,
    GameModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpAndWsExceptionFilter,
    },
  ],
})
export class AppModule {}
