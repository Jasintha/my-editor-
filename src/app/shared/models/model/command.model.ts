import { IEvent } from '@shared/models/model/microservice-event.model';
import { IWorkflowMapping } from './api-input.model';

export interface ICommand {
  uuid?: string;
  operationType?: string;
  name?: string;
  description?: string;
  projectUuid?: string;
  status?: string;
  event?: IEvent;
  resourcePath?: string;
  enableSecurity?: boolean;
  apiStyleType?: string;
  grpcMethod?: string;
  subruleuuid?: string;
  subruleMapping?: IWorkflowMapping[];
  createWorkflow?: boolean;
}

export class Command implements ICommand {
  constructor(
    public uuid?: string,
    public name?: string,
    public operationType?: string,
    public description?: string,
    public projectUuid?: string,
    public status?: string,
    public event?: IEvent,
    public resourcePath?: string,
    public apiStyleType?: string,
    public grpcMethod?: string,
    public enableSecurity?: boolean,
    public subruleuuid?: string,
    public subruleMapping?: IWorkflowMapping[],
    public createWorkflow?: boolean
  ) {}
}
