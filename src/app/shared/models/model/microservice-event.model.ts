import { IAggregate } from '@shared/models/model/aggregate.model';

export interface IEvent {
  uuid?: string;
  type?: string;
  name?: string;
  description?: string;
  projectUuid?: string;
  status?: string;
  isSyncOrAsync?: string;
  aggregate?: IAggregate;
}

export class Event implements IEvent {
  constructor(
    public uuid?: string,
    public name?: string,
    public type?: string,
    public description?: string,
    public projectUuid?: string,
    public status?: string,
    public aggregate?: IAggregate,
    public isSyncOrAsync?: string
  ) {}
}
