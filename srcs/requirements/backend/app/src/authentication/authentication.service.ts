import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { authenticator } from 'otplib';
import Api42 from 'src/config/interfaces/api42.interface';
import * as qrcode from 'qrcode';
import { CreateUser } from 'src/user/interfaces/user.interface';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private httpService: HttpService,
  ) {}

  async auth42(code: string) {
    const token_obj = await this.getTokenObj(code);
    const user_obj = await this.getUserObj(token_obj.data.access_token);
    const user = await this.userService.findByLogin(user_obj.data.login);
    if (user) {
      return user;
    }
    return this.auth42NewLogin(user_obj);
  }

  validateMfaSetup(mfaEnabled: boolean, mfaSecret: string) {
    if (
      this.isMfaSetup(mfaEnabled, mfaSecret) ||
      !this.isMfaSetup(mfaEnabled, mfaSecret)
    ) {
      return;
    }
    throw new Error('wrong MFA setup');
  }

  private isMfaSetup(mfaEnabled: boolean, mfaSecret: string) {
    return mfaEnabled && mfaSecret;
  }

  verifyMfaCode(mfaSecret: string, mfaToken: string) {
    if (!mfaToken) {
      throw new Error('missing MFA code');
    }
    const isVerified = authenticator.verify({
      token: mfaToken,
      secret: mfaSecret,
    });
    if (!isVerified) {
      throw new Error('invalid MFA code');
    }
  }

  async createSession(login: string) {
    const session_token = this.jwtService.sign({ login: login });
    await this.userService.setSession(login, session_token);
    return session_token;
  }

  async deleteSession(login: string) {
    await this.userService.setSession(login, null);
  }

  async setMfa(login: string) {
    const secret = await this.generateMfaSecret(login);
    const otpauthUrl = authenticator.keyuri(
      login,
      this.configService.get<string>('mfa.app_name'),
      secret,
    );
    return otpauthUrl;
  }

  async generateQRCode(otpauthUrl: string) {
    try {
      const qrCode = await qrcode.toDataURL(otpauthUrl);
      if (qrCode) {
        return qrCode;
      }
    } catch (error) {
      // console.error('Failed to create QR code:', error);
    }
    throw new Error('failed to create QR code');
  }

  private async getTokenObj(code: string) {
    const api42 = this.configService.get<Api42>('api42');
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.intra.42.fr/oauth/token',
          {
            grant_type: 'authorization_code',
            client_id: api42.client_id,
            client_secret: api42.client_secret,
            code: code,
            redirect_uri: api42.redirect_url,
          },
          null,
        ),
      );
      if (response) {
        return response;
      }
    } catch (error) {
      console.error(
        'Failed to exchange code (' +
          code +
          ') of client (' +
          api42.client_id +
          ') for token:',
        error.message,
      );
    }
    throw new Error('failed to exchange code for token');
  }

  private async getUserObj(access_token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://api.intra.42.fr/v2/me', {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }),
      );
      if (response) {
        return response;
      }
    } catch (error) {
      console.error(
        'Failed to get token information from access_token (' +
          access_token +
          '):',
          error.message,
      );
    }
    throw new Error('failed to get token information');
  }

  private async auth42NewLogin(user_obj: any) {
    const userData: CreateUser = {
      login: user_obj.data.login,
      firstname: user_obj.data.first_name,
      lastname: user_obj.data.last_name,
      email: user_obj.data.email,
    };
    const user = await this.userService.create(userData);
    return user;
  }

  private async generateMfaSecret(login: string) {
    const secret = authenticator.generateSecret();
    await this.userService.setMfaSecret(login, secret);
    return secret;
  }

  async authSession(request: any, cookieKey: string) {
    const headersCookie =
      request?.headers?.cookie || request?.handshake?.headers?.cookie;
    if (!headersCookie) {
      throw new Error('no session');
    }

    const cookies = headersCookie.split(';');
    let session: string;
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === cookieKey) {
        session = value;
        break;
      }
    }
    if (!session) {
      throw new Error('no session');
    }

    const token_obj = this.jwtService.verify(session);
    if (!token_obj) {
      throw new Error('invalid session');
    }

    const user = await this.userService.findByLogin(token_obj.login);
    if (!user) {
      throw new Error('user not found');
    }

    if (user.session !== session) {
      throw new Error("user and session don't match");
    }

    request.login = user.login;
  }
}
