import { IDatamodel } from '@shared/models/model/datamodel.model';

export interface IBuiltInPage {
  uuid?: string;
  pageId?: string;
  pagetype?: string;
  name?: string;
  datamodel?: IDatamodel;
  projectUuid?: string;
  status?: string;
}

export class BuiltInPage implements IBuiltInPage {
  constructor(
    public uuid?: string,
    public pageId?: string,
    public pagetype?: string,
    public name?: string,
    public datamodel?: IDatamodel,
    public projectUuid?: string,
    public status?: string
  ) {}
}
