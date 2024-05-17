import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import User from './entities/user.entity';
import Stats from './entities/stats.entity';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import Friend from './entities/friend.entity';
import { FriendService } from './friend.service';
import { StatsService } from './stats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Stats, Friend]),
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
    forwardRef(() => AuthenticationModule),
  ],
  controllers: [UserController],
  providers: [UserService, FriendService, StatsService],
  exports: [UserService, FriendService, StatsService],
})
export class UserModule {}
