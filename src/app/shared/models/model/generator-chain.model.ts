export interface IGeneratorComponents {
  id?: string;
  name?: string;
  type?: string;
  active?: boolean;
  lang?: string;
  target?: string;
}

export class GeneratorComponents implements IGeneratorComponents {
  constructor(
    public id?: string,
    public name?: string,
    public type?: string,
    public active?: boolean,
    public lang?: string,
    public target?: string
  ) {}
}

export interface IGenerator {
  position?: number;
  generator?: IGeneratorComponents;
}

export class Generator implements IGenerator {
  constructor(public position?: number, public generator?: IGeneratorComponents) {}
}


export interface IServiceGenStatus {
  status?: string;
  name?: string;
  serviceid?: string;
  buildid?: string;
  logs?: string;
}

export class ServiceGenStatus implements IServiceGenStatus {
  constructor(
      public status?: string,
      public name?: string,
      public serviceid?: string,
      public buildid?: string,
      public logs?: string,
  ) {}
}

export interface IRestartServiceData {
  name?: string;
  namespace?: string;
  resourceName?: string;
  version?: string;
  kind?: string;
  group?: string;
}

export class RestartServiceData implements IRestartServiceData {
  constructor(
      public name?: string,
      public namespace?: string,
      public resourceName?: string,
      public version?: string,
      public kind?: string,
      public group?: string,
  ) {
  }
}