import { Module, forwardRef } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule,
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
    forwardRef(() => UserModule),
    HttpModule,
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
