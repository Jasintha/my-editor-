import { IDatasource } from '@shared/models/model/datasource.model';

export interface IPanel {
  uuid?: string;
  name?: string;
  projectUuid?: string;
  status?: string;
  type?: string;
  ruleid?: string;
  format?: string;
  dataSource?: IDatasource;
  propertyData?: IPropertyData[];
  mode?: string;
  baseColor?: string;
  steps?: IStep[];
}

export class Panel implements IPanel {
  constructor(
    public uuid?: string,
    public name?: string,
    public projectUuid?: string,
    public type?: string,
    public ruleid?: string,
    public format?: string,
    public dataSource?: IDatasource,
    public propertyData?: IPropertyData[],
    public mode?: string,
    public baseColor?: string,
    public steps?: IStep[]
  ) {}
}

export interface IPropertyData {
  name?: string;
  key?: string;
  dataType?: string;
  panelType?: string;
  value?: string;
}

export class PropertyData implements IPropertyData {
  constructor(public name?: string, public key?: string, public dataType?: string, public panelType?: string) {}
}

export interface IPropertyDataRequest {
  name?: string;
  key?: string;
  dataType?: string;
  panelType?: string;
}

export class PropertyDataRequest implements IPropertyDataRequest {
  constructor(public name?: string, public key?: string, public dataType?: string, public panelType?: string, public value?: string) {}
}

export interface IStep {
  color?: string;
  value?: number;
}

export class Step implements IStep {
  constructor(public color?: string, public value?: number) {}
}
