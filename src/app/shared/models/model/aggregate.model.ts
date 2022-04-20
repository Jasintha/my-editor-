import {IEvent} from '@shared/models/model/microservice-event.model';

export interface IAggregate {
  uuid?: string;
  name?: string;
  description?: string;
  template?: string;
  projectUuid?: string;
  status?: string;
  type?: string;
  events?: IEvent[];
  data?: any;
  isComplexObj?: boolean;
  jsonContent?: string;
  representation?: string;
}

export class Aggregate implements IAggregate {
  constructor(
    public uuid?: string,
    public name?: string,
    public description?: string,
    public template?: string,
    public projectUuid?: string,
    public status?: string,
    public type?: string,
    public events?: IEvent[],
    public data?: any,
    public isComplexObj?: boolean,
    public jsonContent?: string,
    public representation?: string
  ) {}
}
