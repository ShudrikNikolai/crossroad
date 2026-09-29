import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventMap, EventName } from './events';

@Injectable()
export class EventService {
  constructor(private readonly emitter: EventEmitter2) {}

  emit<K extends EventName>(event: K, payload: EventMap[K]): void {
    this.emitter.emit(event, payload);
  }

  async emitAsync<K extends EventName>(
    event: K,
    payload: EventMap[K],
  ): Promise<void> {
    await this.emitter.emitAsync(event, payload);
  }
}
