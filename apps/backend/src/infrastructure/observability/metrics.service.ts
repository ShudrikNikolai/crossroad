import { Injectable } from '@nestjs/common';
import { metrics, Counter, Histogram } from '@opentelemetry/api';

@Injectable()
export class MetricsService {
  private readonly meter = metrics.getMeter('crossroad');

  private readonly storyGeneratedCounter = this.meter.createCounter(
    'crossroad.story.generated',
    {
      description: 'Number of generated stories',
    },
  );

  private readonly llmRequestDuration = this.meter.createHistogram(
    'crossroad.llm.request.duration',
    {
      description: 'LLM request duration',
      unit: 'ms',
    },
  );

  private readonly requestTimeoutCounter = this.meter.createCounter(
    'crossroad.http.request.timeout',
    {
      description: 'Number of HTTP requests terminated by timeout',
    },
  );

  storyGenerated(): void {
    this.storyGeneratedCounter.add(1);
  }

  recordLlmRequestDuration(duration: number): void {
    this.llmRequestDuration.record(duration);
  }

  requestTimeout(): void {
    this.requestTimeoutCounter.add(1);
  }
}
