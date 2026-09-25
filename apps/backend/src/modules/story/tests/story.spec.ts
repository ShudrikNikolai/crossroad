import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { StoryService } from '../story/story.service';
import { StoryRepository } from '../story/story.repository';

describe('StoryService', () => {
  let service: StoryService;

  let repository: {
    findById: ReturnType<typeof vi.fn>;
    findByAuthor: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    updateById: ReturnType<typeof vi.fn>;
    setStatus: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoryService,
        {
          provide: StoryRepository,
          useValue: {
            findById: vi.fn(),
            findByAuthor: vi.fn(),
            create: vi.fn(),
            updateById: vi.fn(),
            setStatus: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(StoryService);
    repository = module.get(StoryRepository);

    vi.clearAllMocks();
  });

  describe('findById', () => {
    it('should return story when found', async () => {
      const story = { _id: 'story-1', title: 'Test' };
      repository.findById.mockResolvedValue(story);

      const result = await service.findById('story-1');

      expect(result).toEqual(story);
      expect(repository.findById).toHaveBeenCalledWith('story-1');
    });

    it('should throw NotFoundException when story does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('story-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByAuthor', () => {
    it('should delegate to repository', async () => {
      const stories = [{ _id: 'story-1' }];
      repository.findByAuthor.mockResolvedValue(stories);

      const result = await service.findByAuthor('author-1');

      expect(result).toEqual(stories);
      expect(repository.findByAuthor).toHaveBeenCalledWith('author-1');
    });
  });

  describe('create', () => {
    it('should create story via repository', async () => {
      const data = { title: 'New story', description: 'desc' };
      const created = { _id: 'story-1', ...data, authorId: 'author-1' };
      repository.create.mockResolvedValue(created);

      const result = await service.create('author-1', data);

      expect(result).toEqual(created);
      expect(repository.create).toHaveBeenCalledWith({
        title: data.title,
        description: data.description,
        authorId: 'author-1',
      });
    });
  });

  describe('assertEditable', () => {
    it('should return story when owner and status is draft', async () => {
      const story = {
        authorId: { toString: () => 'author-1' },
        status: 'draft',
      };
      repository.findById.mockResolvedValue(story);

      const result = await service.assertEditable('story-1', 'author-1');

      expect(result).toEqual(story);
    });

    it('should throw ForbiddenException when caller is not the owner', async () => {
      const story = {
        authorId: { toString: () => 'author-1' },
        status: 'draft',
      };
      repository.findById.mockResolvedValue(story);

      await expect(
        service.assertEditable('story-1', 'someone-else'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when story is already published', async () => {
      const story = {
        authorId: { toString: () => 'author-1' },
        status: 'published',
      };
      repository.findById.mockResolvedValue(story);

      await expect(
        service.assertEditable('story-1', 'author-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when story does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.assertEditable('story-1', 'author-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('assertOwnership', () => {
    it('should return story regardless of status, when owner matches', async () => {
      const story = {
        authorId: { toString: () => 'author-1' },
        status: 'published',
      };
      repository.findById.mockResolvedValue(story);

      const result = await service.assertOwnership('story-1', 'author-1');

      expect(result).toEqual(story);
    });

    it('should throw ForbiddenException when caller is not the owner', async () => {
      const story = {
        authorId: { toString: () => 'author-1' },
        status: 'draft',
      };
      repository.findById.mockResolvedValue(story);

      await expect(
        service.assertOwnership('story-1', 'someone-else'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should call assertEditable then update via repository', async () => {
      const story = {
        authorId: { toString: () => 'author-1' },
        status: 'draft',
      };
      repository.findById.mockResolvedValue(story);
      repository.updateById.mockResolvedValue({ ...story, title: 'Updated' });

      const result = await service.update('story-1', 'author-1', {
        title: 'Updated',
      });

      expect(result).toEqual({ ...story, title: 'Updated' });
      expect(repository.updateById).toHaveBeenCalledWith('story-1', {
        title: 'Updated',
      });
    });

    it('should propagate assertEditable rejection without calling repository.updateById', async () => {
      const story = {
        authorId: { toString: () => 'author-1' },
        status: 'published',
      };
      repository.findById.mockResolvedValue(story);

      await expect(
        service.update('story-1', 'author-1', { title: 'Updated' }),
      ).rejects.toThrow(ConflictException);

      expect(repository.updateById).not.toHaveBeenCalled();
    });
  });

  describe('setStatus', () => {
    it('should delegate to repository', async () => {
      const updated = { _id: 'story-1', status: 'published' };
      repository.setStatus.mockResolvedValue(updated);

      const result = await service.setStatus('story-1', 'published');

      expect(result).toEqual(updated);
      expect(repository.setStatus).toHaveBeenCalledWith('story-1', 'published');
    });
  });
});
