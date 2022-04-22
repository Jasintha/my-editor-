export interface IFormField {
  propertyName?: string;
  isLinkedProperty?: boolean;
  selectType?: string;
  children?: string;
}

export class FormField implements IFormField {
  constructor(public propertyName?: string, public isLinkedProperty?: boolean, public selectType?: string, public children?: string) {}
}

export interface ISourceTargetFieldsRequest {
  sourceFormFields?: IFormField[];
  targetFormFields?: IFormField[];
}

export class SourceTargetFieldsRequest implements ISourceTargetFieldsRequest {
  constructor(public sourceFormFields?: IFormField[], public targetFormFields?: IFormField[]) {}
}
