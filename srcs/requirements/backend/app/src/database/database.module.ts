import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('postgres.database.host'),
        port: configService.get<number>('postgres.database.port'),
        username: configService.get<string>('postgres.database.user'),
        password: configService.get<string>('postgres.database.password'),
        database: configService.get<string>('postgres.database.name'),
        entities: [__dirname + '../**/entities/*.entity.{js,ts}'],
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
