import { IProject } from '@shared/models/model/project.model';
import { IAPIInput } from '@shared/models/model/api-input.model';

export interface IEntityapi {
  uuid?: string;
  name?: string;
  datamodel?: IEntityAPIDatamodel;
  queryParams?: IAPIInput[];
  pathParams?: IAPIInput[];
  ruleId?: string;
  project?: IProject;
  operation?: string;
  returnRecordType?: string;
  returnType?: IAPIInput;
  status?: string;
}

export class Entityapi implements IEntityapi {
  constructor(
    public uuid?: string,
    public name?: string,
    public datamodel?: IEntityAPIDatamodel,
    public queryParams?: IAPIInput[],
    public pathParams?: IAPIInput[],
    public ruleId?: string,
    public operation?: string,
    public project?: IProject,
    public returnRecordType?: string,
    public returnType?: IAPIInput,
    public status?: string
  ) {}
}

export interface IEntityAPIDatamodel {
  name?: string;
  datamodelId?: number;
}

export class EntityAPIDatamodel implements IEntityAPIDatamodel {
  constructor(public name?: string, public datamodelId?: number) {}
}
