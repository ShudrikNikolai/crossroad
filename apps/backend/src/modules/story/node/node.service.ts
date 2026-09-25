import { Injectable, NotFoundException } from '@nestjs/common';
import { NodeRepository } from './node.repository';
import { StoryService } from '../story/story.service';
import type { TCreateNodeSchema, TUpdateNodeSchema } from '@crossroad/schemas';

@Injectable()
export class NodeService {
  constructor(
    private readonly nodeRepository: NodeRepository,
    private readonly storyService: StoryService,
  ) {}

  findAllByStory(storyId: string) {
    return this.nodeRepository.findAllByStory(storyId);
  }

  async create(authorId: string, data: TCreateNodeSchema) {
    await this.storyService.assertEditable(data.storyId, authorId);
    return this.nodeRepository.create({
      storyId: data.storyId as any,
      id: data.id,
      type: data.type,
      position: data.position,
      content: data.content,
    });
  }

  async updatePosition(
    storyId: string,
    nodeId: string,
    authorId: string,
    position: { x: number; y: number },
  ) {
    await this.storyService.assertEditable(storyId, authorId);
    return this.nodeRepository.updatePosition(storyId, nodeId, position);
  }

  async update(
    storyId: string,
    nodeId: string,
    authorId: string,
    data: TUpdateNodeSchema,
  ) {
    await this.storyService.assertEditable(storyId, authorId);
    const updated = await this.nodeRepository.updateNode(storyId, nodeId, data);
    if (!updated) throw new NotFoundException('API_STORY_ERROR.NODE_NOT_FOUND');
    return updated;
  }

  async delete(storyId: string, nodeId: string, authorId: string) {
    await this.storyService.assertEditable(storyId, authorId);
    return this.nodeRepository.deleteOne(storyId, nodeId);
  }
}
