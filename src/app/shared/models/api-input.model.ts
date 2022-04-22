import {ISubruleParameter} from "@shared/models/subrule.model";


export const enum APIInputType {
  MODEL = 'MODEL',
  DTO = 'DTO',
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  FLOAT = 'FLOAT',
  TRUE_OR_FALSE = 'TRUE_OR_FALSE',
  DATE = 'DATE',
  ANY = 'ANY',
  FILE = 'FILE',
}

export const enum APIParamType {
  QUERY = 'QUERY',
  PATH = 'PATH',
  BODY = 'BODY',
  FILE = 'FILE',
  MESSAGE = 'MESSAGE',
  RETURN = 'RETURN',
  RESPONSE = 'RESPONSE',
}

export interface IAPIInput {
  id?: string;
  paramType?: APIParamType;
  inputType?: APIInputType;
  inputName?: string;
}

export class APIInput implements IAPIInput {
  constructor(public id?: string, public inputType?: APIInputType, public paramType?: APIParamType, public inputName?: string) {}
}

export interface IWorkflowMapping {
  subruleInput?: ISubruleParameter;
  mappedInput?: IAPIInput;
}

export class WorkflowMapping implements IWorkflowMapping {
  constructor(public subruleInput?: ISubruleParameter, public mappedInput?: IAPIInput) {}
}
