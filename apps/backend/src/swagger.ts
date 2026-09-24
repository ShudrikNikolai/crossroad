import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerService } from '@/infra/logger/logger.service';
import { ConfigService } from '@/config';
import { cleanupOpenApiDoc } from 'nestjs-zod';

const setupSwagger = (
  app: INestApplication,
  config: ConfigService,
  logger: LoggerService,
): void => {
  const { name, port, version } = config.app;
  const { enable, path } = config.swagger;

  if (!enable) {
    return;
  }

  const documentBuilder = new DocumentBuilder()
    .setTitle(name)
    .setDescription(`${name} API document`)
    .setVersion(version)
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token', // имя схемы — должно совпадать с @ApiBearerAuth('access-token')
    );

  const document = SwaggerModule.createDocument(app, documentBuilder.build(), {
    ignoreGlobalPrefix: false,
    extraModels: [],
  });
  const cleanedDocument = cleanupOpenApiDoc(document);

  SwaggerModule.setup(path, app, cleanedDocument, {});

  logger.log(`Swagger running on http://127.0.0.1:${port}/${path}`);
};

export default setupSwagger;
