import { IAPIInput, APIInputType } from './model/api-input.model';


export interface IHybridfunction {
  uuid?: string;
  name?: string;
  params?: IHybridfunctionParameter[];
  projectUuid?: string;
  returnRecordType?: string;
  status?: string;
  type?: string;
  code?: string;
  returnObj?: IAPIInput;
}

export class Hybridfunction implements IHybridfunction {
  constructor(
    public uuid?: string,
    public name?: string,
    public type?: string,
    public language?: string,
    public params?: IHybridfunctionParameter[],
    public projectUuid?: string,
    public returnRecordType?: string,
    public status?: string,
    public returnObj?: IAPIInput,
    public code?: string
  ) {}
}

export interface IHybridfunctionParameter {
  id?: string;
  paramRecordType?: string;
  inputType?: APIInputType;
  inputName?: string;
  paramName?: string;
}

export class HybridfunctionParameter implements IHybridfunctionParameter {
  constructor(
    public id?: string,
    public inputType?: APIInputType,
    public paramRecordType?: string,
    public inputName?: string,
    public paramName?: string
  ) {}
}
