import { UserCreatedEvent, USER_CREATED_EVENT } from './user-created.event';

export type EventName = keyof EventMap;

export interface EventMap {
  [USER_CREATED_EVENT]: UserCreatedEvent;
}
