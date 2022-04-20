import { IDatamodel } from '@shared/models/model/datamodel.model';

export const enum Inputtype {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  FLOAT = 'FLOAT',
  TRUE_OR_FALSE = 'TRUE_OR_FALSE',
  FILE_UPLOAD = 'FILE_UPLOAD'
}

export interface IProperty {
  id?: number;
  name?: string;
  type?: Inputtype;
  datamodel?: IDatamodel;
  validators?: string[];
  label?: string;
  data?: any;
}

export class Property implements IProperty {
  constructor(
    public id?: number,
    public name?: string,
    public type?: Inputtype,
    public datamodel?: IDatamodel,
    public validators?: string[],
    public label?: string,
    public data?: any
  ) {}
}
