import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';

import { NodeService } from '../node/node.service';
import { NodeRepository } from '../node/node.repository';
import { StoryService } from '../story/story.service';

describe('NodeService', () => {
  let service: NodeService;

  let repository: {
    findAllByStory: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    updatePosition: ReturnType<typeof vi.fn>;
    updateOne: ReturnType<typeof vi.fn>;
    deleteOne: ReturnType<typeof vi.fn>;
  };

  let storyService: {
    assertEditable: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NodeService,
        {
          provide: NodeRepository,
          useValue: {
            findAllByStory: vi.fn(),
            create: vi.fn(),
            updatePosition: vi.fn(),
            updateOne: vi.fn(),
            deleteOne: vi.fn(),
          },
        },
        {
          provide: StoryService,
          useValue: {
            assertEditable: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(NodeService);
    repository = module.get(NodeRepository);
    storyService = module.get(StoryService);

    vi.clearAllMocks();
  });

  describe('findAllByStory', () => {
    it('should delegate to repository without touching StoryService', async () => {
      const nodes = [{ id: 'node-1' }];
      repository.findAllByStory.mockResolvedValue(nodes);

      const result = await service.findAllByStory('story-1');

      expect(result).toEqual(nodes);
      // чтение графа не требует проверки владения/статуса — иначе публичный просмотр опубликованных историй сломается
      expect(storyService.assertEditable).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should check editability before creating', async () => {
      storyService.assertEditable.mockResolvedValue(undefined);
      const created = { id: 'node-1' };
      repository.create.mockResolvedValue(created);

      const data = {
        storyId: 'story-1',
        id: 'node-1',
        type: 'scene' as const,
        position: { x: 0, y: 0 },
        content: { text: 'hello' },
      };

      const result = await service.create('author-1', data);

      expect(result).toEqual(created);
      expect(storyService.assertEditable).toHaveBeenCalledWith(
        'story-1',
        'author-1',
      );
      expect(repository.create).toHaveBeenCalledWith({
        storyId: data.storyId,
        id: data.id,
        type: data.type,
        position: data.position,
        content: data.content,
      });
    });

    it('should not create node when story is not editable', async () => {
      const error = new Error('not editable');
      storyService.assertEditable.mockRejectedValue(error);

      await expect(
        service.create('author-1', {
          storyId: 'story-1',
          id: 'node-1',
          type: 'scene' as const,
          position: { x: 0, y: 0 },
          content: { text: 'hello' },
        }),
      ).rejects.toBe(error);

      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('updatePosition', () => {
    it('should check editability then update position', async () => {
      storyService.assertEditable.mockResolvedValue(undefined);
      repository.updatePosition.mockResolvedValue({
        id: 'node-1',
        position: { x: 10, y: 20 },
      });

      const result = await service.updatePosition(
        'story-1',
        'node-1',
        'author-1',
        { x: 10, y: 20 },
      );

      expect(result).toEqual({ id: 'node-1', position: { x: 10, y: 20 } });
      expect(storyService.assertEditable).toHaveBeenCalledWith(
        'story-1',
        'author-1',
      );
      expect(repository.updatePosition).toHaveBeenCalledWith(
        'story-1',
        'node-1',
        { x: 10, y: 20 },
      );
    });
  });

  describe('update', () => {
    it('should return updated node when found', async () => {
      storyService.assertEditable.mockResolvedValue(undefined);
      const updated = { id: 'node-1', type: 'scene' };
      repository.updateOne.mockResolvedValue(updated);

      const result = await service.update('story-1', 'node-1', 'author-1', {
        type: 'scene' as const,
      });

      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when node does not exist', async () => {
      storyService.assertEditable.mockResolvedValue(undefined);
      repository.updateOne.mockResolvedValue(null);

      await expect(
        service.update('story-1', 'missing-node', 'author-1', {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not touch repository when story is not editable', async () => {
      storyService.assertEditable.mockRejectedValue(new Error('locked'));

      await expect(
        service.update('story-1', 'node-1', 'author-1', {}),
      ).rejects.toThrow('locked');

      expect(repository.updateOne).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should check editability before deleting', async () => {
      storyService.assertEditable.mockResolvedValue(undefined);
      repository.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await service.delete('story-1', 'node-1', 'author-1');

      expect(result).toEqual({ deletedCount: 1 });
      expect(storyService.assertEditable).toHaveBeenCalledWith(
        'story-1',
        'author-1',
      );
    });
  });
});
