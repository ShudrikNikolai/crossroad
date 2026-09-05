import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@/config';
import { DbService } from './db.service';
import { PinoLogger } from 'nestjs-pino';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService, logger: PinoLogger) => {
        const configDB = configService.database;
        return {
          uri: configDB.dbUri,
          dbName: configDB.dbName,
          user: configDB.username,
          pass: configDB.password,
          retryAttempts: 5,
          retryDelay: 3000,
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              logger.info('MongoDB connected successfully');
            });
            connection.on('error', (error: unknown) => {
              logger.error('MongoDB connection error:', error);
            });
            return connection;
          },
        };
      },
      inject: [ConfigService, PinoLogger],
    }),
  ],
  providers: [DbService],
  exports: [DbService],
})
export class DbModule {}
