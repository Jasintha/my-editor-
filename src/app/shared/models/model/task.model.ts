import { IEvent } from '@shared/models/model/microservice-event.model';
import { IAPIInput, IWorkflowMapping } from '@shared/models/model/api-input.model';

export interface ITask {
  uuid?: string;
  operation?: string;
  name?: string;
  description?: string;
  projectUuid?: string;
  status?: string;
  event?: IEvent;
  ruleId?: string;
  timeUnit?: string;
  time?: number;
  subject?: string;
  frequency?: string;
  //fileType?:string;
  fileLocation?: string;
  url?: string;
  serviceCallType?: string;
  action?: string;
  params?: IAPIInput[];
  targetInput?: IAPIInput;
  returnRecordType?: string;
  returnObj?: IAPIInput;
  subruleuuid?: string;
  subruleMapping?: IWorkflowMapping[];
  createWorkflow?: boolean;
}

export class Task implements ITask {
  constructor(
    public uuid?: string,
    public name?: string,
    public operation?: string,
    public description?: string,
    public projectUuid?: string,
    public status?: string,
    public subject?: string,
    public ruleId?: string,
    public timeUnit?: string,
    public time?: number,
    public event?: IEvent,
    //public fileType?: string,
    public fileLocation?: string,
    public frequency?: string,
    public url?: string,
    public serviceCallType?: string,
    public action?: string,
    public returnRecordType?: string,
    public targetInput?: IAPIInput,
    public params?: IAPIInput[],
    public returnObj?: IAPIInput,
    public subruleuuid?: string,
    public subruleMapping?: IWorkflowMapping[],
    public createWorkflow?: boolean
  ) {}
}
