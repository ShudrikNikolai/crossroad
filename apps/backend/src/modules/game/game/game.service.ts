import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlaythroughRepository } from './game.repository';
import { STORY_PORT, type IStoryPort } from '@/modules/story/ports/story.port';
import { RedisService } from '@/infrastructure/redis/redis.service';
import { EventService } from '@/infrastructure/event/event.service';
import { evaluateConditions } from '../utils/evaluate-condition.util';
import {
  GAME_EVENTS,
  PUBLISHED_GRAPH_CACHE_PREFIX,
  PUBLISHED_GRAPH_CACHE_TTL_SECONDS,
} from '../consts';
import type { TGameStepResponse, TPlaythroughStatus } from '@crossroad/schemas';

type PublishedGraph = NonNullable<
  Awaited<ReturnType<IStoryPort['getPublishedGraph']>>
>;

@Injectable()
export class GameService {
  constructor(
    private readonly playthroughRepository: PlaythroughRepository,
    @Inject(STORY_PORT) private readonly storyPort: IStoryPort,
    private readonly redisService: RedisService, // TODO поправить, т.к. как и event
    private readonly eventService: EventService,
  ) {}

  async start(userId: string, storyId: string): Promise<TGameStepResponse> {
    const graph = await this.getPublishedGraph(storyId);

    const variables = this.buildInitialVariables(graph);

    const playthrough = await this.playthroughRepository.create({
      userId: userId as any,
      storyId: storyId as any,
      currentNodeId: graph.story.startNodeId,
      variables,
      status: 'in_progress',
    });

    return this.buildStepResponse(playthrough, graph);
  }

  async nextStep(
    playthroughId: string,
    userId: string,
    edgeId: string,
  ): Promise<TGameStepResponse> {
    const playthrough =
      await this.playthroughRepository.findById(playthroughId);
    if (!playthrough)
      throw new NotFoundException('API_GAME_ERROR.PLAYTHROUGH_NOT_FOUND');
    if (playthrough.userId.toString() !== userId)
      throw new ForbiddenException('API_GAME_ERROR.NOT_OWNER');
    if (playthrough.status === 'completed')
      throw new ConflictException('API_GAME_ERROR.PLAYTHROUGH_COMPLETED');

    const graph = await this.getPublishedGraph(playthrough.storyId.toString());

    const availableEdges = this.getAvailableEdges(
      graph,
      playthrough.currentNodeId,
      playthrough.variables,
    );
    const chosenEdge = availableEdges.find((edge) => edge.id === edgeId);
    if (!chosenEdge)
      throw new BadRequestException('API_GAME_ERROR.INVALID_CHOICE');

    const targetNode = graph.nodes.find(
      (node) => node.id === chosenEdge.target,
    );
    if (!targetNode)
      throw new NotFoundException('API_GAME_ERROR.NODE_NOT_FOUND'); // граф невалиден- не должно происходить, публикация обязана поймать эту хйню

    const newStatus: TPlaythroughStatus =
      targetNode.type === 'end' ? 'completed' : 'in_progress';

    const updated = await this.playthroughRepository.updateState(
      playthroughId,
      {
        currentNodeId: targetNode.id,
        status: newStatus,
        traversedEdgeId: chosenEdge.id,
      },
    );

    // await this.eventService.emitAsync('GAME_EVENTS.NODE_PLAYED', {
    //   userId,
    //   storyId: playthrough.storyId.toString(),
    //   playthroughId,
    //   edgeId: chosenEdge.id,
    //   nodeId: targetNode.id,
    // });

    // if (newStatus === 'completed') {
    //   await this.eventService.emitAsync(GAME_EVENTS.STORY_COMPLETED, {
    //     userId,
    //     storyId: playthrough.storyId.toString(),
    //     playthroughId,
    //   });
    // }

    return this.buildStepResponse(updated!, graph);
  }

  async getState(
    playthroughId: string,
    userId: string,
  ): Promise<TGameStepResponse> {
    const playthrough =
      await this.playthroughRepository.findById(playthroughId);
    if (!playthrough)
      throw new NotFoundException('API_GAME_ERROR.PLAYTHROUGH_NOT_FOUND');
    if (playthrough.userId.toString() !== userId)
      throw new ForbiddenException('API_GAME_ERROR.NOT_OWNER');

    const graph = await this.getPublishedGraph(playthrough.storyId.toString());
    return this.buildStepResponse(playthrough, graph);
  }

  private async getPublishedGraph(storyId: string): Promise<PublishedGraph> {
    const cacheKey = `${PUBLISHED_GRAPH_CACHE_PREFIX}${storyId}`;

    const cached = await this.redisService.get(cacheKey);
    if (cached) return JSON.parse(`${cached}`) as PublishedGraph; // TODO

    const graph = await this.storyPort.getPublishedGraph(storyId);
    if (!graph)
      throw new NotFoundException('API_GAME_ERROR.STORY_NOT_PUBLISHED');

    await this.redisService.set(
      cacheKey,
      JSON.stringify(graph),
      PUBLISHED_GRAPH_CACHE_TTL_SECONDS,
    );
    return graph;
  }

  private buildInitialVariables(
    graph: PublishedGraph,
  ): Record<string, string | number | boolean> {
    return Object.fromEntries(
      graph.variables.map((v) => [v.key, v.defaultValue]),
    ) as Record<string, string | number | boolean>; // TODO
  }

  private getAvailableEdges(
    graph: PublishedGraph,
    currentNodeId: string,
    variables: Record<string, string | number | boolean>,
  ) {
    return graph.edges.filter(
      (edge) =>
        edge.source === currentNodeId &&
        evaluateConditions(edge.conditions as any, variables),
    );
  }

  private buildStepResponse(
    playthrough: {
      _id: any;
      currentNodeId: string;
      status: TPlaythroughStatus;
      variables: Record<string, string | number | boolean>;
    },
    graph: PublishedGraph,
  ): TGameStepResponse {
    const node = graph.nodes.find((n) => n.id === playthrough.currentNodeId);
    if (!node) throw new NotFoundException('API_GAME_ERROR.NODE_NOT_FOUND');

    const choices = this.getAvailableEdges(
      graph,
      playthrough.currentNodeId,
      playthrough.variables,
    ).map((edge) => ({
      edgeId: edge.id,
      label: edge.label,
    }));

    return {
      playthroughId: playthrough._id.toString(),
      status: playthrough.status,
      node: {
        id: node.id,
        type: node.type as any,
        content: node.content as any,
      },
      choices,
    };
  }
}
