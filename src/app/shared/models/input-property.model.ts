import { ICustomObject } from './model/custom-object.model';

export const enum InputDataType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  FLOAT = 'FLOAT',
  TRUE_OR_FALSE = 'TRUE_OR_FALSE',
  DATE = 'DATE'
}

export interface IInputProperty {
  uuid?: string;
  name?: string;
  inputDataType?: InputDataType;
  projectUuid?: string;
  isCustomObjectProperty?: boolean;
  isErrorObject?: boolean;
  customObject?: ICustomObject;
}

export class InputProperty implements IInputProperty {
  constructor(
    public uuid?: string,
    public name?: string,
    public inputDataType?: InputDataType,
    public projectUuid?: string,
    public isCustomObjectProperty?: boolean,
    public isErrorObject?: boolean,
    public customObject?: ICustomObject
  ) {}
}
