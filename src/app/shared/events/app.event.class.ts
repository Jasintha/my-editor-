import { EventTypes } from './event.queue';

export class AppEvent<T> {
  constructor(public type: EventTypes, public payload: T) {}
}
