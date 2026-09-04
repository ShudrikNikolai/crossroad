import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {LoginWithEmailOrUsernameSchema} from '@crossroad/schemas'

async function bootstrap() {
  let _ = LoginWithEmailOrUsernameSchema // test
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
