import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WebSocketAdapter } from './gateway/websocket.adapter';
import { AuthenticationService } from './authentication/authentication.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  const authenticationService = app.get(AuthenticationService);

  app.useWebSocketAdapter(
    new WebSocketAdapter(app, configService, authenticationService),
  );
  await app.listen(port);
}
bootstrap();
