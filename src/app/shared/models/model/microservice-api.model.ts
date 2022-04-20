import { IAPIInput, IWorkflowMapping } from '@shared/models/model/api-input.model';

export const enum APIType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export interface IApi {
  uuid?: string;
  name?: string;
  type?: string;
  aPIInputs?: IAPIInput;
  params?: IAPIInput[];
  ruleId?: string;
  projectUuid?: string;
  operation?: string;
  returnRecordType?: string;
  status?: string;
  returnObj?: IAPIInput;
  resourcePath?: string;
  enableSecurity?: boolean;
  apiStyleType?: string;
  grpcMethod?: string;
  subruleuuid?: string;
  subruleMapping?: IWorkflowMapping[];
  createWorkflow?: boolean;
}

export class Api implements IApi {
  constructor(
    public uuid?: string,
    public name?: string,
    public type?: string,
    public aPIInputs?: IAPIInput,
    public params?: IAPIInput[],
    public ruleId?: string,
    public operation?: string,
    public projectUuid?: string,
    public returnRecordType?: string,
    public status?: string,
    public returnObj?: IAPIInput,
    public resourcePath?: string,
    public enableSecurity?: boolean,
    public grpcMethod?: string,
    public apiStyleType?: string,
    public subruleuuid?: string,
    public subruleMapping?: IWorkflowMapping[],
    public createWorkflow?: boolean
  ) {}
}
