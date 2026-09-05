import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import { Configs } from './cfg';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      load: Object.values(Configs),
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
