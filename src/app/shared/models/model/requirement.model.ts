
export interface IRequirement {
  uuid?: string;
  name?: string;
  reqdate?: any;
  medium?: string;
  participants?: string;
  category?: string;
  type?: string;
  priority?: string;
  tags?: string[];
  eta?: any;
  projectUuid?: string;
  description?: string;
  status?: string;
  epicUuid?: string;
  createdAt?: string;
}

export class Requirement implements IRequirement {
  constructor(
    public uuid?: string,
    public name?: string,
    public medium?: string,
    public participants?: string,
    public category?: string,
    public type?: string,
    public priority?: string,
    public tags?: string[],
    public reqdate?: any,
    public eta?: any,
    public projectUuid?: string,
    public description?: string,
    public epicUuid?: string,
    public status?: string,
    public createdAt?: string,
  ) {}
}

export interface IEpic {
  uuid?: string;
  name?: string;
  projectUuid?: string;
  description?: string;
  requirements?: any[];
  status?: string;
  referenceName?: string;
}

export class Epic implements IEpic {
  constructor(
    public uuid?: string,
    public name?: string,
    public projectUuid?: string,
    public description?: string,
    public requirements?: any[],
    public status?: string,
    public referenceName ?: string
  ) {}
}

export interface IStory {
  uuid?: string;
  name?: string;
  projectUuid?: string;
  description?: string;
  requirementUUID?: string;
  epicUUID?: string;
  status?: string;
  actor?: string;
  screen?: string;
  action?: string;
  screentype?: string;
  storyTemplate?: string;
}

export class Story implements IStory {
  constructor(
    public uuid?: string,
    public name?: string,
    public projectUuid?: string,
    public description?: string,
    public requirementUUID?: string,
    public epicUUID?: string,
    public actor?: string,
    public screen?: string,
    public action?: string,
    public screentype?: string,
    public status?: string,
    public storyTemplate?: string
  ) {}
}

export interface IWorkflow {
  uuid?: string;
  name?: string;
  projectUuid?: string;
  description?: string;
  requirementUUID?: string;
  epicUUID?: string;
  storyUUID?: string;
  status?: string;
  actor?: string;
  screen?: string;
  action?: string;
  behaviour?: string;
  roles?: IRole[];
}

export class Workflow implements IWorkflow {
  constructor(
    public uuid?: string,
    public name?: string,
    public projectUuid?: string,
    public description?: string,
    public requirementUUID?: string,
    public epicUUID?: string,
    public storyUUID?: string,
    public actor?: string,
    public screen?: string,
    public action?: string,
    public behaviour?: string,
    public status?: string,
    public roles?: IRole[]
  ) {}
}

export interface IWorkflowScreenReq {
  workflowUuid?: string;
  portalname?: string;
  projectUuid?: string;
  portalCreateType?: string;
  themestyle?: string;
  portalUUID?: string;
  screenCreateType?: string;
  screenName?: string;
  template?: string;
  screenUUID?: string;
  action?: string;
}

export class WorkflowScreenReq implements IWorkflowScreenReq {
  constructor(
    public workflowUuid?: string,
    public portalname?: string,
    public projectUuid?: string,
    public portalCreateType?: string,
    public themestyle?: string,
    public portalUUID?: string,
    public screenCreateType?: string,
    public template?: string,
    public screenUUID?: string,
    public action?: string,
    public screenName?: string
  ) {}
}

export interface IWorkflowActivatorReq {
  workflowUuid?: string;
  projectUuid?: string;
  serviceCreateType?: string;
  servicename?: string;
  template?: string;
  serviceUUID?: string;
  endpointType?: string;
  apiCreateType?: string;
  apiName?: string;
  apiOperation?: string;
  apiGrpcMethod?: string;
  apiProtocol?: string;
  apiUUID?: string;
  inputModelCreateType?: string;
  inputModelName?: string;
  inputModelType?: string;
  inputModelUUID?: string;
  outputModelCreateType?: string;
  outputModelName?: string;
  outputModelType?: string;
  outputModelUUID?: string;
  returnRecordType?: string;
  ruletype?: string;
}

export class WorkflowActivatorReq implements IWorkflowActivatorReq {
  constructor(
    public workflowUuid?: string,
    public projectUuid?: string,
    public serviceCreateType?: string,
    public servicename?: string,
    public template?: string,
    public serviceUUID?: string,
    public endpointType?: string,
    public apiCreateType?: string,
    public apiName?: string,
    public apiOperation?: string,
    public apiGrpcMethod?: string,
    public apiProtocol?: string,
    public apiUUID?: string,
    public inputModelCreateType?: string,
    public inputModelName?: string,
    public inputModelType?: string,
    public inputModelUUID?: string,
    public outputModelCreateType?: string,
    public outputModelName?: string,
    public outputModelType?: string,
    public outputModelUUID?: string,
    public returnRecordType?: string,
    public ruletype?: string
  ) {}
}

export interface IRole {
  name?: string;
  id?: string;
}

export class Role implements IRole {
  constructor(public name?: string, public id?: string) {}
}

export interface IStatusChangeRequest {
  uuid?: string;
  status?: string;
}

export class StatusChangeRequest implements IStatusChangeRequest {
  constructor(public uuid?: string, public status?: string) {}
}


export interface IStoryUpdateReq {
  uuid?: string;
  storyText?: string;
  projectUuid?: string;
}

export class StoryUpdateReq implements IStoryUpdateReq {
  constructor(public uuid?: string, public storyText?: string , public projectUuid?: string) {}
}
