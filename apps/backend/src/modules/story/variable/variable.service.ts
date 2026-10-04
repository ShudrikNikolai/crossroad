import { StoryService } from '../core/story.service';
import { VariableRepository } from './variable.repository';
import type {
  TCreateVariableSchema,
  TUpdateVariableSchema,
} from '@crossroad/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class VariableService {
  constructor(
    private readonly variableRepository: VariableRepository,
    private readonly storyService: StoryService,
  ) {}

  findAllByStory(storyId: string) {
    return this.variableRepository.findAllByStory(storyId);
  }

  async create(authorId: string, storyId: string, data: TCreateVariableSchema) {
    await this.storyService.assertEditable(storyId, authorId);
    return this.variableRepository.create({
      storyId: storyId as any,
      ...data,
    });
  }

  async update(
    storyId: string,
    key: string,
    authorId: string,
    data: TUpdateVariableSchema,
  ) {
    await this.storyService.assertEditable(storyId, authorId);
    const updated = await this.variableRepository.updateOneVariable(
      storyId,
      key,
      data,
    );
    if (!updated) throw new NotFoundException('VARIABLE_NOT_FOUND');
    return updated;
  }

  async delete(storyId: string, key: string, authorId: string) {
    await this.storyService.assertEditable(storyId, authorId);
    return this.variableRepository.deleteOne(storyId, key);
  }
}
