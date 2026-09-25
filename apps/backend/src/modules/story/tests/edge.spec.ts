import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';

import { EdgeService } from '../edge/edge.service';
import { EdgeRepository } from '../edge/edge.repository';
import { StoryService } from '../story/story.service';

describe('EdgeService', () => {
  let service: EdgeService;

  let repository: {
    findAllByStory: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    updateOne: ReturnType<typeof vi.fn>;
    deleteOne: ReturnType<typeof vi.fn>;
  };

  let storyService: {
    assertEditable: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EdgeService,
        {
          provide: EdgeRepository,
          useValue: {
            findAllByStory: vi.fn(),
            create: vi.fn(),
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

    service = module.get(EdgeService);
    repository = module.get(EdgeRepository);
    storyService = module.get(StoryService);

    vi.clearAllMocks();
  });

  describe('findAllByStory', () => {
    it('should delegate to repository without checking editability', async () => {
      const edges = [{ id: 'edge-1' }];
      repository.findAllByStory.mockResolvedValue(edges);

      const result = await service.findAllByStory('story-1');

      expect(result).toEqual(edges);
      expect(storyService.assertEditable).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should check editability before creating', async () => {
      storyService.assertEditable.mockResolvedValue(undefined);
      const created = { id: 'edge-1' };
      repository.create.mockResolvedValue(created);

      const data = {
        storyId: 'story-1',
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        label: 'Go left',
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
        source: data.source,
        target: data.target,
        label: data.label,
        conditions: undefined,
      });
    });

    it('should not create edge when story is not editable', async () => {
      const error = new Error('not editable');
      storyService.assertEditable.mockRejectedValue(error);

      await expect(
        service.create('author-1', {
          storyId: 'story-1',
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        }),
      ).rejects.toBe(error);

      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should return updated edge when found', async () => {
      storyService.assertEditable.mockResolvedValue(undefined);
      const updated = { id: 'edge-1', label: 'Updated' };
      repository.updateOne.mockResolvedValue(updated);

      const result = await service.update('story-1', 'edge-1', 'author-1', {
        label: 'Updated',
      });

      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when edge does not exist', async () => {
      storyService.assertEditable.mockResolvedValue(undefined);
      repository.updateOne.mockResolvedValue(null);

      await expect(
        service.update('story-1', 'missing-edge', 'author-1', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should check editability before deleting', async () => {
      storyService.assertEditable.mockResolvedValue(undefined);
      repository.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await service.delete('story-1', 'edge-1', 'author-1');

      expect(result).toEqual({ deletedCount: 1 });
      expect(storyService.assertEditable).toHaveBeenCalledWith(
        'story-1',
        'author-1',
      );
    });
  });
});
