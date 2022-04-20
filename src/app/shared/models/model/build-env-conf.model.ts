import { IBuild } from '@shared/models/model/build.model';

export interface IBuildEnvConf {
  uuid?: number;
  envKey?: string;
  envValue?: string;
  action?: string;
  build?: IBuild;
}

export class BuildEnvConf implements IBuildEnvConf {
  constructor(public uuid?: number, public envKey?: string, public envValue?: string, public action?: string, public build?: IBuild) {}
}

export interface IBuildEnv {
  key?: string;
  value?: string;
}

export class BuildEnv implements IBuildEnv {
  constructor(public key?: string, public value?: string) {}
}
