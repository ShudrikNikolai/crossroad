import { UserCreatedEvent, USER_CREATED_EVENT } from './user-created.event';

export type PARAMETRS = UserCreatedEvent;
export type EVENTS = typeof USER_CREATED_EVENT;

export * from './user-created.event';
