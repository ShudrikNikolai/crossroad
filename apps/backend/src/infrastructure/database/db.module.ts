import { Module } from "@nestjs/common";
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRootAsync({
    imports: [],// ConfigModule
    // useFactory: async name=crossroads
  })]
})
export class DbModule {}
