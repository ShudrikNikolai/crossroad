import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { InfrastructureModule } from './infrastructure/infra.module';

@Module({
  imports: [
    ConfigModule,
    InfrastructureModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
