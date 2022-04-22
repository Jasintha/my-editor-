import { IDatamodel } from './model/datamodel.model';


export const enum Datalink {
  HAS_ONE = 'HAS_ONE',
  HAS_MANY = 'HAS_MANY',
  MANY_TO_MANY = 'MANY_TO_MANY'
}

export interface ILink {
  uuid?: string;
  type?: Datalink;
  from?: IDatamodel;
  to?: IDatamodel;
  projectUuid?: string;
  status?: string;
}

export class Link implements ILink {
  constructor(
    public uuid?: string,
    public type?: Datalink,
    public from?: IDatamodel,
    public to?: IDatamodel,
    public projectUuid?: string,
    public status?: string
  ) {}
}
