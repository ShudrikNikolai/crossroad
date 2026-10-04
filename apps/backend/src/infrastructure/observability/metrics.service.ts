import { Injectable } from '@nestjs/common';
import { metrics } from '@opentelemetry/api';

@Injectable()
export class MetricsService {
  private readonly meter = metrics.getMeter('crossroad');

  userRegistered(): void {
    this.userRegisteredCounter.add(1);
  }

  storyPublished(): void {
    this.storyPublishedCounter.add(1);
  }

  requestTimeout(route?: string): void {
    this.requestTimeoutCounter.add(1, route ? { route } : undefined);
  }

  playthroughCompleted(storyId: string): void {
    this.playthroughCompletedCounter.add(1, { storyId });
  }

  mediaUploadConfirmed(purpose: string): void {
    this.mediaUploadConfirmedCounter.add(1, { purpose });
  }

  private readonly requestTimeoutCounter = this.meter.createCounter(
    'crossroad.http.request.timeout',
    { description: 'Number of HTTP requests terminated by timeout' },
  );

  private readonly playthroughCompletedCounter = this.meter.createCounter(
    'crossroad.game.playthrough.completed',
    { description: 'Number of completed story playthroughs' },
  );

  private readonly mediaUploadConfirmedCounter = this.meter.createCounter(
    'crossroad.media.upload.confirmed',
    { description: 'Number of confirmed media uploads' },
  );

  private readonly userRegisteredCounter = this.meter.createCounter(
    'crossroad.user.registered',
    { description: 'Number of completed user registrations' },
  );

  private readonly storyPublishedCounter = this.meter.createCounter(
    'crossroad.story.published',
    { description: 'Number of stories published' },
  );
}
