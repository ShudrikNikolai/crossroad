import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@/config/config.service';
import { DbService } from './db.service';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const configDB = configService.database
        return {
          uri: configDB.dbUri,
          dbName: configDB.dbName,
          user: configDB.username,
          pass: configDB.password,
          //...configDB,
          retryAttempts: 5,
          retryDelay: 3000,
          connectionFactory: (connection) => {
            connection.on('connected', () => { // TODO Pino-logger
              console.log('MongoDB connected successfully');
            });
            connection.on('error', (error: unknown) => {
              console.error('MongoDB connection error:', error);
            });
            return connection;
          },
        }
      },
      inject: [ConfigService],
    }),
  ],
  providers: [DbService],
  exports: [DbService]
})
export class DbModule {}
