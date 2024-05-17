import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NextFunction } from 'express';
import { ServerOptions } from 'socket.io';
import { AuthenticationService } from 'src/authentication/authentication.service';

export class WebSocketAdapter extends IoAdapter {
  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
    private readonly authenticationService: AuthenticationService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    port = this.configService.get<number>('ws_port');
    const server = super.createIOServer(port, options);

    server.use(async (client: any, next: NextFunction) => {
      try {
        await this.authenticationService.authSession(client, 'session');
        next();
      } catch (error) {
        // console.log(error.message);
        client.emit('authError', error.message);
      }
    });
    return server;
  }
}
