import { IKeyData } from '@shared/models/model/keydata.model';
export interface ISecret {
  uuid?: string;
  envuuid?: string;
  name?: string;
  namespace?: string;
  keyData?: IKeyData[];
  version?: string;
  description?: string;
  type?: string;
}

export class Secret implements ISecret {
  constructor(
    public uuid?: string,
    public envuuid?: string,
    public name?: string,
    public namespace?: string,
    public version?: string,
    public description?: string,
    public type?: string,
    public keyData?: IKeyData[]
  ) {}
}
