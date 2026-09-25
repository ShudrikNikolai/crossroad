import { BadRequestException, Injectable } from '@nestjs/common';
import { StoryService } from '../story/story.service';
import { NodeService } from '../node/node.service';
import { EdgeService } from '../edge/edge.service';
import { VariableService } from '../variable/variable.service';

@Injectable()
export class StoryFacade {
  constructor(
    private readonly storyService: StoryService,
    private readonly nodeService: NodeService,
    private readonly edgeService: EdgeService,
    private readonly variableService: VariableService,
  ) {}

  async getFullGraph(storyId: string) {
    const [story, nodes, edges, variables] = await Promise.all([
      this.storyService.findById(storyId),
      this.nodeService.findAllByStory(storyId),
      this.edgeService.findAllByStory(storyId),
      this.variableService.findAllByStory(storyId),
    ]);
    return { story, nodes, edges, variables };
  }

  async publish(storyId: string, authorId: string) {
    const story = await this.storyService.assertOwnership(storyId, authorId);
    const [nodes, edges] = await Promise.all([
      this.nodeService.findAllByStory(storyId),
      this.edgeService.findAllByStory(storyId),
    ]);

    this.validateGraph(story, nodes, edges);

    return this.storyService.setStatus(storyId, 'published');
  }

  private validateGraph(
    story: { startNodeId?: string },
    nodes: any[],
    edges: any[],
  ) {
    if (!story.startNodeId) {
      throw new BadRequestException('API_STORY_ERROR.NO_START_NODE');
    }
    const nodeIds = new Set(nodes.map((n) => n.id));
    if (!nodeIds.has(story.startNodeId)) {
      throw new BadRequestException('API_STORY_ERROR.START_NODE_NOT_FOUND');
    }

    const nodesWithOutgoingEdge = new Set(edges.map((e) => e.source));
    const deadEnds = nodes.filter(
      (n) => n.type !== 'end' && !nodesWithOutgoingEdge.has(n.id),
    );
    if (deadEnds.length > 0) {
      throw new BadRequestException(
        `API_STORY_ERROR.DEAD_END_NODES: ${deadEnds.map((n) => n.id).join(', ')}`,
      );
    }
  }
}
