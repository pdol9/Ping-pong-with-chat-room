import {
  Controller,
  Post,
  Req,
  Res,
  Body,
  UseGuards,
  ForbiddenException,
  InternalServerErrorException,
  Get,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from './auth.guard';
import { AuthenticationService } from './authentication.service';
import RequestWithLogin from './interfaces/requestWithLogin.interface';
import MfaDto from './dto/mfa.dto';
import Login42Dto from './dto/login42.dto';
import User from 'src/user/entities/user.entity';
import { MfaGuard } from './mfa.guard';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('validateSession')
  async getSessionUser(@Req() request: RequestWithLogin) {
    const user = await this.userService.findByLogin(request.login);
    return this.userService.getPreview(user);
  }

  @Post('42login')
  async login42(
    @Body() body: Login42Dto,
    @Res({ passthrough: true }) response: Response,
  ) {
    let user: User;
    try {
      user = await this.authenticationService.auth42(body.code);
      this.authenticationService.validateMfaSetup(
        user.mfaEnabled,
        user.mfaSecret,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (user.mfaEnabled) {
      const mfa_token = await this.authenticationService.createSession(
        user.login,
      );
      response
        .cookie('mfa', mfa_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          expires: new Date(new Date().getTime() + 1 * 60 * 1000),
        })
        .status(403)
        .send('provide mfa code');
      return;
    }

    const session_token = await this.authenticationService.createSession(
      user.login,
    );
    response
      .cookie('session', session_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        expires: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000),
      })
      .status(200)
      .send(this.userService.getPreview(user));
    return;
  }

  @UseGuards(MfaGuard)
  @Post('mfa/login')
  async loginMfa(
    @Body() body: MfaDto,
    @Req() request: RequestWithLogin,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const user = await this.userService.findByLogin(request.login);
      this.authenticationService.verifyMfaCode(user.mfaSecret, body.mfa);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    const session_token = await this.authenticationService.createSession(
      request.login,
    );
    const user = await this.userService.findByLogin(request.login);
    response
      .clearCookie('mfa', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        expires: new Date(new Date().getTime()),
      })
      .cookie('session', session_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        expires: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000),
      })
      .status(200)
      .send(this.userService.getPreview(user));
    return;
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(
    @Req() request: RequestWithLogin,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authenticationService.deleteSession(request.login);
    const user = await this.userService.findByLogin(request.login);
    response
      .clearCookie('session', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        expires: new Date(new Date().getTime()),
      })
      .status(200)
      .send(this.userService.getPreview(user));
    return;
  }

  @UseGuards(AuthGuard)
  @Post('mfa/enable')
  async enableMfa(@Req() request: RequestWithLogin) {
    const otpauthUrl = await this.authenticationService.setMfa(request.login);
    try {
      const qrCode = await this.authenticationService.generateQRCode(
        otpauthUrl,
      );
      return qrCode;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(AuthGuard)
  @Post('mfa/verify')
  async verifyMfa(@Body() body: MfaDto, @Req() request: RequestWithLogin) {
    try {
      const user = await this.userService.findByLogin(request.login);
      this.authenticationService.verifyMfaCode(user.mfaSecret, body.mfa);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    await this.userService.setMfaEnabled(request.login, true);
  }

  @UseGuards(AuthGuard)
  @Post('mfa/disable')
  async disableMfa(@Req() request: RequestWithLogin) {
    await this.userService.setMfaEnabled(request.login, false);
    await this.userService.setMfaSecret(request.login, null);
  }
}
