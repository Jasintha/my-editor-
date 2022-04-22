import {IKeyData} from "@shared/models/keydata.model";

export interface IConfigMap {
  uuid?: string;
  envuuid?: string;
  name?: string;
  namespace?: string;
  version?: string;
  description?: string;
  keyData?: IKeyData[];
  confMapText?: string;
}

export class ConfigMap implements IConfigMap {
  constructor(
    public uuid?: string,
    public envuuid?: string,
    public name?: string,
    public namespace?: string,
    public keyData?: IKeyData[],
    public confMapText?: string,
    public version?: string,
    public description?: string
  ) {}
}
