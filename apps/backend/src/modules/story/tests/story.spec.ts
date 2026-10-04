import { StoryRepository } from '../core/story.repository';
import { StoryService } from '../core/story.service';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('StoryService', () => {
  let service: StoryService;

  let repository: {
    findById: ReturnType<typeof vi.fn>;
    findByAuthor: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    updateById: ReturnType<typeof vi.fn>;
    setStatus: ReturnType<typeof vi.fn>;
    toPublic: ReturnType<typeof vi.fn>;
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
            toPublic: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(StoryService);
    repository = module.get(StoryRepository);

    vi.clearAllMocks();
    repository.toPublic.mockImplementation((doc: any) => Promise.resolve(doc));
  });

  describe('findById', () => {
    it('should return the public shape via repository.toPublic', async () => {
      const rawStory = { _id: 'story-1', title: 'Test' };
      const publicStory = { id: 'story-1', title: 'Test' };

      repository.findById.mockResolvedValue(rawStory);
      repository.toPublic.mockResolvedValue(publicStory);

      const result = await service.findById('story-1');

      expect(result).toEqual(publicStory);
      expect(repository.findById).toHaveBeenCalledWith('story-1');
      expect(repository.toPublic).toHaveBeenCalledWith(rawStory);
    });

    it('should throw NotFoundException when story does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('story-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.toPublic).not.toHaveBeenCalled();
    });
  });

  describe('getStories', () => {
    it('should delegate to findByAuthor', async () => {
      const findByAuthorSpy = vi
        .spyOn(service, 'findByAuthor')
        .mockResolvedValue([{ id: 'story-1' } as any]);

      const result = await service.getStories('author-1');

      expect(result).toEqual([{ id: 'story-1' }]);
      expect(findByAuthorSpy).toHaveBeenCalledWith('author-1');
    });
  });

  describe('create', () => {
    it('should create story via repository without an extra toPublic call', async () => {
      const data = { title: 'New story', description: 'desc' };
      const created = { id: 'story-1', ...data, authorId: 'author-1' };
      repository.create.mockResolvedValue(created);

      const result = await service.create('author-1', data);

      expect(result).toEqual(created);
      expect(repository.create).toHaveBeenCalledWith({
        title: data.title,
        description: data.description,
        authorId: 'author-1',
      });

      expect(repository.toPublic).not.toHaveBeenCalled();
    });
  });

  describe('assertEditable', () => {
    it('should return the story when owner and status is draft', async () => {
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
    it('should return the story regardless of status, when owner matches', async () => {
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
    it('should check editability, update, then return the public shape', async () => {
      const story = {
        authorId: { toString: () => 'author-1' },
        status: 'draft',
      };
      const updatedRaw = { ...story, title: 'Updated' };
      const updatedPublic = { id: 'story-1', title: 'Updated' };

      repository.findById.mockResolvedValue(story);
      repository.updateById.mockResolvedValue(updatedRaw);
      repository.toPublic.mockImplementation((doc: any) =>
        Promise.resolve(doc === updatedRaw ? updatedPublic : doc),
      );

      const result = await service.update('story-1', 'author-1', {
        title: 'Updated',
      });

      expect(result).toEqual(updatedPublic);
      expect(repository.updateById).toHaveBeenCalledWith('story-1', {
        title: 'Updated',
      });
    });

    it('should not call repository.updateById when the story is not editable', async () => {
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
      const updated = { id: 'story-1', status: 'published' };
      repository.setStatus.mockResolvedValue(updated);

      const result = await service.setStatus('story-1', 'published');

      expect(result).toEqual(updated);
      expect(repository.setStatus).toHaveBeenCalledWith('story-1', 'published');
    });
  });
});
