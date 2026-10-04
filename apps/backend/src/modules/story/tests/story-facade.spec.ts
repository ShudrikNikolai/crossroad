import { StoryService } from '../core/story.service';
import { EdgeService } from '../edge/edge.service';
import { StoryFacade } from '../facades/story.facade';
import { NodeService } from '../node/node.service';
import { VariableService } from '../variable/variable.service';
import { MetricsService } from '@/infrastructure/observability/metrics.service';
import { BadRequestException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('StoryFacade', () => {
  let facade: StoryFacade;

  let storyService: {
    findById: ReturnType<typeof vi.fn>;
    assertOwnership: ReturnType<typeof vi.fn>;
    assertEditable: ReturnType<typeof vi.fn>;
    setStatus: ReturnType<typeof vi.fn>;
  };
  let nodeService: { findAllByStory: ReturnType<typeof vi.fn> };
  let edgeService: { findAllByStory: ReturnType<typeof vi.fn> };
  let variableService: { findAllByStory: ReturnType<typeof vi.fn> };
  let metricsService: { storyPublished: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoryFacade,
        {
          provide: StoryService,
          useValue: {
            findById: vi.fn(),
            assertOwnership: vi.fn(),
            assertEditable: vi.fn(),
            setStatus: vi.fn(),
          },
        },
        { provide: NodeService, useValue: { findAllByStory: vi.fn() } },
        { provide: EdgeService, useValue: { findAllByStory: vi.fn() } },
        { provide: VariableService, useValue: { findAllByStory: vi.fn() } },
        { provide: MetricsService, useValue: { storyPublished: vi.fn() } },
      ],
    }).compile();

    facade = module.get(StoryFacade);
    storyService = module.get(StoryService);
    nodeService = module.get(NodeService);
    edgeService = module.get(EdgeService);
    variableService = module.get(VariableService);
    metricsService = module.get(MetricsService);

    vi.clearAllMocks();
  });

  describe('getFullGraph', () => {
    it('should assemble story + nodes + edges + variables', async () => {
      storyService.findById.mockResolvedValue({ id: 'story-1' });
      nodeService.findAllByStory.mockResolvedValue([{ id: 'node-1' }]);
      edgeService.findAllByStory.mockResolvedValue([{ id: 'edge-1' }]);
      variableService.findAllByStory.mockResolvedValue([{ key: 'gold' }]);

      const result = await facade.getFullGraph('story-1');

      expect(result).toEqual({
        story: { id: 'story-1' },
        nodes: [{ id: 'node-1' }],
        edges: [{ id: 'edge-1' }],
        variables: [{ key: 'gold' }],
      });
    });
  });

  describe('publish', () => {
    const validStory = { startNodeId: 'start' };
    const validNodes = [
      { id: 'start', type: 'scene' },
      { id: 'end', type: 'end' },
    ];
    const validEdges = [{ id: 'edge-1', source: 'start', target: 'end' }];

    it('should publish a valid graph and record the metric', async () => {
      storyService.assertOwnership.mockResolvedValue(validStory);
      nodeService.findAllByStory.mockResolvedValue(validNodes);
      edgeService.findAllByStory.mockResolvedValue(validEdges);
      storyService.setStatus.mockResolvedValue({
        id: 'story-1',
        status: 'published',
      });

      const result = await facade.publish('story-1', 'author-1');

      expect(result).toEqual({ id: 'story-1', status: 'published' });
      expect(storyService.assertOwnership).toHaveBeenCalledWith(
        'story-1',
        'author-1',
      );
      expect(storyService.setStatus).toHaveBeenCalledWith(
        'story-1',
        'published',
      );
      expect(metricsService.storyPublished).toHaveBeenCalledTimes(1);
    });

    it('should reject when the story has no startNodeId', async () => {
      storyService.assertOwnership.mockResolvedValue({
        startNodeId: undefined,
      });
      nodeService.findAllByStory.mockResolvedValue(validNodes);
      edgeService.findAllByStory.mockResolvedValue(validEdges);

      await expect(facade.publish('story-1', 'author-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(storyService.setStatus).not.toHaveBeenCalled();
      expect(metricsService.storyPublished).not.toHaveBeenCalled();
    });

    it('should reject when startNodeId does not match any existing node', async () => {
      storyService.assertOwnership.mockResolvedValue({
        startNodeId: 'missing-node',
      });
      nodeService.findAllByStory.mockResolvedValue(validNodes);
      edgeService.findAllByStory.mockResolvedValue(validEdges);

      await expect(facade.publish('story-1', 'author-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(storyService.setStatus).not.toHaveBeenCalled();
    });

    it('should reject when a non-end node has no outgoing edge (dead end)', async () => {
      storyService.assertOwnership.mockResolvedValue(validStory);
      nodeService.findAllByStory.mockResolvedValue([
        { id: 'start', type: 'scene' },
        { id: 'orphan', type: 'scene' },
        { id: 'end', type: 'end' },
      ]);
      edgeService.findAllByStory.mockResolvedValue(validEdges);

      await expect(facade.publish('story-1', 'author-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(storyService.setStatus).not.toHaveBeenCalled();
    });

    it('should allow an "end" node to have no outgoing edges', async () => {
      storyService.assertOwnership.mockResolvedValue(validStory);
      nodeService.findAllByStory.mockResolvedValue(validNodes);
      edgeService.findAllByStory.mockResolvedValue(validEdges);
      storyService.setStatus.mockResolvedValue({
        id: 'story-1',
        status: 'published',
      });

      await expect(
        facade.publish('story-1', 'author-1'),
      ).resolves.toBeDefined();
    });

    it('should not call setStatus when assertOwnership rejects', async () => {
      const error = new Error('not owner');
      storyService.assertOwnership.mockRejectedValue(error);

      await expect(facade.publish('story-1', 'author-1')).rejects.toBe(error);
      expect(nodeService.findAllByStory).not.toHaveBeenCalled();
      expect(storyService.setStatus).not.toHaveBeenCalled();
    });
  });

  describe('assertEditable', () => {
    it('should delegate to storyService.assertEditable', async () => {
      storyService.assertEditable.mockResolvedValue(undefined);

      await facade.assertEditable('story-1', 'author-1');

      expect(storyService.assertEditable).toHaveBeenCalledWith(
        'story-1',
        'author-1',
      );
    });
  });
});
