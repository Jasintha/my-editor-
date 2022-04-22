import { IDatamodel } from './datamodel.model';

export interface IView {
  uuid?: string;
  viewId?: string;
  viewtype?: string;
  viewtitle?: string;
  viewtemplate?: string;
  datamodel?: IDatamodel;
  projectUuid?: string;
}

export class View implements IView {
  constructor(
    public uuid?: string,
    public viewId?: string,
    public viewtype?: string,
    public viewtitle?: string,
    public viewtemplate?: string,
    public viewDatamodel?: IDatamodel,
    public projectUuid?: string
  ) {}
}
