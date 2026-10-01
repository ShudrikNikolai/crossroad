import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StoryRepository } from './story.repository';
import type { StoryDocument } from './story.model';
import type {
  TCreateStorySchema,
  TUpdateStorySchema,
} from '@crossroad/schemas';

@Injectable()
export class StoryService {
  constructor(private readonly storyRepository: StoryRepository) {}

  async findById(id: string): Promise<any> {
    const story = await this.storyRepository.findById(id);
    if (!story) throw new NotFoundException('API_STORY_ERROR.NOT_FOUND');
    return this.storyRepository.toPublic(story);
  }

  async findByAuthor(authorId: string): Promise<any[]> {
    const authorStories = await this.storyRepository.findByAuthor(authorId);
    console.log('authorStories >>>', authorStories)
    return authorStories.map((story) => this.storyRepository.toPublic(story));
  }

  async create(authorId: string, data: TCreateStorySchema): Promise<any> {
    return this.storyRepository.create({
      title: data.title,
      description: data.description,
      authorId: authorId as any, // TODO кастонуть потом нормально к типу objectId
    });
  }

  async update(id: string, authorId: string, data: TUpdateStorySchema) {
    await this.assertEditable(id, authorId); // draft + владение
    const upd = await this.storyRepository.updateById(id, data);
    return this.storyRepository.toPublic(upd as any)
  }

  /**
   * Единая точка входа для node/edge/variable сервисов:
   * возвращает story, если её можно редактировать, иначе кидает ошибку.
   */
  async assertEditable(
    storyId: string,
    authorId: string,
  ): Promise<any> {
    const story = await this.findById(storyId);

    if (story.authorId.toString() !== authorId) {
      throw new ForbiddenException('API_STORY_ERROR.NOT_OWNER');
    }
    if (story.status === 'published') {
      throw new ConflictException('API_STORY_ERROR.STORY_IS_PUBLISHED');
    }

    return story;
  }

  /** Только для проверки владения без блокировки по статусу нужно для publish() в фасаде */
  async assertOwnership(
    storyId: string,
    authorId: string,
  ): Promise<any> {
    const story = await this.findById(storyId);
    if (story.authorId.toString() !== authorId) {
      throw new ForbiddenException('API_STORY_ERROR.NOT_OWNER');
    }
    return story;
  }

  async getStories(authorId: string) {
    console.log('authorId > ', authorId);
    const res = await this.findByAuthor(authorId);
    console.log('res >>>', res)

    return res;
  }

  async setStatus(id: string, status: 'draft' | 'published') {
    return this.storyRepository.setStatus(id, status);
  }
}
