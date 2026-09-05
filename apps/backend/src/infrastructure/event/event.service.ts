import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventService {
  constructor(
    private readonly emitter: EventEmitter2,
  ) {}

  emit<T>(event: string, payload: T): void {
    this.emitter.emit(event, payload);
  }

  emitAsync<T>(event: string, payload: T): Promise<unknown[]> {
    return this.emitter.emitAsync(event, payload);
  }
}
