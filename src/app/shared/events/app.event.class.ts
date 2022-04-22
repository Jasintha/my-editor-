import { EventTypes } from '@shared/events/event.queue';

export class AppEvent<T> {
  constructor(public type: EventTypes, public payload: T) {}
}
