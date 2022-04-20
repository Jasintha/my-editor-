export interface IConnector {
  id?: number;
  name?: string;
  description?: string;
  status?: string;
}

export class Connector implements IConnector {
  constructor(public id?: number, public name?: string, public description?: string, public status?: string) {}
}

export interface IPlugin {
  name?: string;
  version?: string;
  description?: string;
  category?: string;
  publisher?: string;
  location?: string;
  branch?: string;
  prefix?: string;
}

export class Plugin implements IPlugin {
  constructor(
    public name?: string,
    public version?: string,
    public description?: string,
    public category?: string,
    public publisher?: string,
    public location?: string,
    public branch?: string,
    public prefix?: string
  ) {}
}

export interface IPlugArray {
  p2name?: string;
  plugins?: IPlugin[];
  version?: string;
}

export class PlugArray implements IPlugArray {
  constructor(public p2name?: string, public plugins?: Plugin[], public version?: string) {}
}
