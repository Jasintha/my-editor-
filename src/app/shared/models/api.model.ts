import {IAPIInput} from "@shared/models/api-input.model";


export const enum APIType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND'
}

export interface IApi {
  id?: number;
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
}

export class Api implements IApi {
  constructor(
    public id?: number,
    public name?: string,
    public type?: string,
    public aPIInputs?: IAPIInput,
    public params?: IAPIInput[],
    public ruleId?: string,
    public operation?: string,
    public projectUuid?: string,
    public returnRecordType?: string,
    public status?: string,
    public returnObj?: IAPIInput
  ) {}
}
