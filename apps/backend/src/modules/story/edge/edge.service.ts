import { StoryService } from '../core/story.service';
import { EdgeRepository } from './edge.repository';
import type { TCreateEdgeSchema, TUpdateEdgeSchema } from '@crossroad/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class EdgeService {
  constructor(
    private readonly edgeRepository: EdgeRepository,
    private readonly storyService: StoryService,
  ) {}

  findAllByStory(storyId: string) {
    return this.edgeRepository.findAllByStory(storyId);
  }

  async create(authorId: string, storyId: string, data: TCreateEdgeSchema) {
    await this.storyService.assertEditable(storyId, authorId);
    return this.edgeRepository.create({
      storyId: storyId as any,
      ...data,
    });
  }

  async update(
    storyId: string,
    edgeId: string,
    authorId: string,
    data: TUpdateEdgeSchema,
  ) {
    await this.storyService.assertEditable(storyId, authorId);
    const updated = await this.edgeRepository.updateEdge(storyId, edgeId, data);
    if (!updated) throw new NotFoundException('API_STORY_ERROR.EDGE_NOT_FOUND');
    return updated;
  }

  async delete(storyId: string, edgeId: string, authorId: string) {
    await this.storyService.assertEditable(storyId, authorId);
    return this.edgeRepository.deleteOne(storyId, edgeId);
  }
}
