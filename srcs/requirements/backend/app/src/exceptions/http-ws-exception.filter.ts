import {
  ExceptionFilter,
  ArgumentsHost,
  Catch,
  HttpException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Response } from 'express';
import { Socket } from 'socket.io';

@Catch(HttpException, WsException)
export class HttpAndWsExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const type = host.getType();

    if (type === 'http') {
      const context = host.switchToHttp();
      const response = context.getResponse<Response>();

      response.status(exception.getStatus()).json(exception.getResponse());
    }
    if (type === 'ws') {
      const context = host.switchToWs();
      const client = context.getClient<Socket>();

      if (typeof exception.getResponse === 'function') {
        client.emit('error', exception.getResponse());
      } else {
        client.emit('wsError', exception);
      }
    }
  }
}
