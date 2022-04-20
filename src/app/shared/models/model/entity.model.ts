import { IEvent } from '@shared/models/model/microservice-event.model';

export interface IEntityModel {
  uuid?: string;
  name?: string;
  description?: string;
  template?: string;
  projectUuid?: string;
  status?: string;
  type?: string;
  events?: IEvent[];
}

export class EntityModel implements IEntityModel {
  constructor(
    public uuid?: string,
    public name?: string,
    public description?: string,
    public template?: string,
    public projectUuid?: string,
    public status?: string,
    public type?: string,
    public events?: IEvent[]
  ) {}
}
