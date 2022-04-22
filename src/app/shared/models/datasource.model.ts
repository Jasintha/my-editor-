import {IProject} from "@shared/models/project.model";

export interface IDatasource {
  uuid?: string;
  datasource?: string;
  databaseName?: string;
  url?: string;
  name?: string;
  username?: string;
  project?: IProject;
  password?: string;
  additionals?: KeyValues[];
}

export class Datasource implements IDatasource {
  constructor(
    public uuid?: string,
    public url?: string,
    public name?: string,
    public databaseName?: string,
    public datasource?: string,
    public project?: IProject,
    public username?: string,
    public password?: string,
    public additionals?: KeyValues[]
  ) {}
}

export interface IKeyValues {
  name?: string;
  key?: string;
  dataType?: string;
  datasourceType?: string;
  value?: string;
}

export class KeyValues implements IKeyValues {
  constructor(public name?: string, public key?: string, public dataType?: string, public datasourceType?: string, public value?: string) {}
}

export interface IKeyValuesRequest {
  name?: string;
  key?: string;
  dataType?: string;
  datasourceType?: string;
}

export class KeyValuesRequest implements IKeyValuesRequest {
  constructor(public name?: string, public key?: string, public dataType?: string, public datasourceType?: string) {}
}
