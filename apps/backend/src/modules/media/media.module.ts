import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoryModule } from '@/modules/story/story.module';
import { MediaModel, MediaRepository, MediaSchema, MediaService } from './core';
import { MediaController } from './controllers/media.controller';
import { MEDIA_PORT } from './ports/media.port';

@Module({
  imports: [
    StoryModule,
    MongooseModule.forFeature([{ name: MediaModel.name, schema: MediaSchema }]),
  ],
  controllers: [MediaController],
  providers: [
    MediaRepository,
    MediaService,
    { provide: MEDIA_PORT, useExisting: MediaService },
  ],
  exports: [MEDIA_PORT],
})
export class MediaModule {}
