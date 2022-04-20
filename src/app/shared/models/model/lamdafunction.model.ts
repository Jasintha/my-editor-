import { IAPIInput, APIInputType } from '@shared/models/model/api-input.model';

export interface ILamdafunction {
  uuid?: string;
  name?: string;
  fnType?: string;
  methodType?: string;
  language?: string;
  params?: ILamdafunctionParameter[];
  projectUuid?: string;
  returnRecordType?: string;
  status?: string;
  code?: string;
  returnObj?: IAPIInput;
}

export class Lamdafunction implements ILamdafunction {
  constructor(
    public uuid?: string,
    public name?: string,
    public language?: string,
    public fnType?: string,
    public methodType?: string,
    public params?: ILamdafunctionParameter[],
    public projectUuid?: string,
    public returnRecordType?: string,
    public status?: string,
    public returnObj?: IAPIInput,
    public code?: string
  ) {}
}

export interface ILamdafunctionParameter {
  id?: string;
  paramRecordType?: string;
  inputType?: APIInputType;
  inputName?: string;
}

export class LamdafunctionParameter implements ILamdafunctionParameter {
  constructor(public id?: string, public inputType?: APIInputType, public paramRecordType?: string, public inputName?: string) {}
}
