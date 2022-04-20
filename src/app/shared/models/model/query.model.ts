
import { IViewmodel } from '@shared/models/model/viewmodel.model';
import { IAPIInput, IWorkflowMapping } from '@shared/models/model/api-input.model';

export interface IQuery {
  uuid?: string;
  name?: string;
  description?: string;
  projectUuid?: string;
  status?: string;
  //aggregates?: IAggregate[];
  viewmodel?: IViewmodel;
  params?: IAPIInput[];
  //mappings?: IQueryModelMapping[];
  resourcePath?: string;
  returnRecordType?: string;
  enableSecurity?: boolean;
  apiStyleType?: string;
  grpcMethod?: string;
  subruleuuid?: string;
  subruleMapping?: IWorkflowMapping[];
  createWorkflow?: boolean;
}

export class Query implements IQuery {
  constructor(
    public uuid?: string,
    public name?: string,
    public description?: string,
    public projectUuid?: string,
    public status?: string,
    //public aggregates?: IAggregate[],
    public viewmodel?: IViewmodel,
    public params?: IAPIInput[],
    //public mappings?: IQueryModelMapping[],
    public returnRecordType?: string,
    public resourcePath?: string,
    public apiStyleType?: string,
    public grpcMethod?: string,
    public enableSecurity?: boolean,
    public subruleuuid?: string,
    public subruleMapping?: IWorkflowMapping[],
    public createWorkflow?: boolean
  ) {}
}
