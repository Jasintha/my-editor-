import { IAPIInput, APIInputType } from './api-input.model';

export interface ISubrule {
  uuid?: string;
  name?: string;
  params?: ISubruleParameter[];
  projectUuid?: string;
  returnRecordType?: string;
  status?: string;
  code?: string;
  ruleId?: string;
  returnObj?: IAPIInput;
}

export class Subrule implements ISubrule {
  constructor(
    public uuid?: string,
    public name?: string,
    public ruleId?: string,
    public language?: string,
    public params?: ISubruleParameter[],
    public projectUuid?: string,
    public returnRecordType?: string,
    public status?: string,
    public returnObj?: IAPIInput,
    public code?: string
  ) {}
}

export interface ISubruleParameter {
  paramRecordType?: string;
  inputType?: APIInputType;
  inputName?: string;
  paramName?: string;
}

export class SubruleParameter implements ISubruleParameter {
  constructor(public inputType?: APIInputType, public paramRecordType?: string, public inputName?: string, public paramName?: string) {}
}
