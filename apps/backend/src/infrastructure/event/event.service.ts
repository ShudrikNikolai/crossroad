import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS, PARAMETRS } from './events';

@Injectable()
export class EventService {
  constructor(private readonly emitter: EventEmitter2) {}

  emit<T extends PARAMETRS>(event: EVENTS, payload: T): void {
    this.emitter.emit(event, payload);
  }

  emitAsync<T extends PARAMETRS>(
    event: EVENTS,
    payload: T,
  ): Promise<unknown[]> {
    return this.emitter.emitAsync(event, payload);
  }
}
