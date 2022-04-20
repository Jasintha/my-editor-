export interface IEvent {
  name?: string;
  code?: string;
}

export class Event implements IEvent {
  constructor(public name?: string, public code?: string) {}
}
