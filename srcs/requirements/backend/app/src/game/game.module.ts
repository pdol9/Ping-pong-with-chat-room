import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Match from './entities/match.entity';
import { UserModule } from 'src/user/user.module';
import { MatchmakingService } from './matchmaking.service';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]),
    UserModule,
    AuthenticationModule,
  ],
  controllers: [MatchController],
  providers: [GameService, MatchmakingService, MatchService],
  exports: [GameService, MatchmakingService, MatchService],
})
export class GameModule {}
