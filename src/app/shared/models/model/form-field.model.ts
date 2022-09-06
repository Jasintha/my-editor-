export interface IFormField {
  propertyName?: string;
  isLinkedProperty?: boolean;
  selectType?: string;
  isVisible?: boolean;
  children?: string;
  propertyType?: string;
  fieldController?: string;
  isrequired?: string;
  placeholder?: string;
  label?: string;
  choiceUrl?: string;
  defaultValue?: string;
  fieldValueChoices?: any;
  choiceType?: string;
  dropdownMappings?: any;
}

export class FormField implements IFormField {
  constructor(public propertyName?: string, public isLinkedProperty?: boolean, public selectType?: string,
              public isVisible?: boolean, public children?: string) {}
}

export interface ISourceTargetFieldsRequest {
  sourceFormFields?: IFormField[];
  targetFormFields?: IFormField[];
}

export class SourceTargetFieldsRequest implements ISourceTargetFieldsRequest {
  constructor(public sourceFormFields?: IFormField[], public targetFormFields?: IFormField[]) {}
}


export interface IRowFieldMapping {
  field?: string;
  rowId?: number;
}

export class RowFieldMapping implements IRowFieldMapping {
  constructor(public field?: string, public rowId?: number) {}
}

export interface IRowHeader {
  rowId?: number;
  rowHeader?: string;
}

export class RowHeader implements IRowHeader {
  constructor(public rowId?: number, public rowHeader?: string) {}
}