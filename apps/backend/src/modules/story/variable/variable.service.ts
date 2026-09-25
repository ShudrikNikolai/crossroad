import { Injectable, NotFoundException } from '@nestjs/common';
import { StoryService } from '../story/story.service';
import type {
  TCreateVariableSchema,
  TUpdateVariableSchema,
} from '@crossroad/schemas';
import { VariableRepository } from './variable.repository';

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
      key: data.key,
      type: data.type,
      defaultValue: data.defaultValue,
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
