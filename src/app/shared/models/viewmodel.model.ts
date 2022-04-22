import { IAggregate } from './aggregate.model';


export interface IViewmodel {
  uuid?: string;
  name?: string;
  description?: string;
  projectUuid?: string;
  status?: string;
  aggregate?: IAggregate;
  isAggregateModel?: boolean;
  configModel?: any[];
  keys?: string[];
  mappings?: IModelMapping[];
}

export class Viewmodel implements IViewmodel {
  constructor(
    public uuid?: string,
    public name?: string,
    public description?: string,
    public projectUuid?: string,
    public status?: string,
    public aggregate?: IAggregate,
    public isAggregateModel?: boolean,
    public configModel?: any[],
    public mappings?: IModelMapping[],
    public keys?: string[]
  ) {}
}

export interface IViewModelMappingRequest {
  viewmodelId?: string;
  mappings?: IModelMapping[];
}

export interface IModelMapping {
  aggregate?: IAggregateModel;
  aggregateKeys?: IModelKeyNode[];
  operator?: string;
  viemodelKey?: IModelKeyNode;
}

export interface IAggregateModel {
  aggregateId?: string;
  name?: string;
}

export interface IModelKeyNode {
  name?: string;
  key?: string;
}
