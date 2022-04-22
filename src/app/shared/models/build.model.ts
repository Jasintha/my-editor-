import {IBuildEnvConf} from "@shared/models/build-env-conf.model";


export interface IBuild {
  uuid?: string;
  name?: string;
  status?: string;
  buildid?: number;
  message?: string;
  url?: string;
  gentype?: string;
  projectUuid?: string;
  environment?: any;
  error?: string;
  errorDescription?: string;
  gitRepoUrl?: string;
  gitBranch?: string;
  keysGenerated?: boolean;
}

export class Build implements IBuild {
  constructor(
    public uuid?: string,
    public name?: string,
    public status?: string,
    public buildid?: number,
    public message?: string,
    public gentype?: string,
    public url?: string,
    public projectUuid?: string,
    public environment?: any,
    public error?: string,
    public errorDescription?: string,
    public gitRepoUrl?: string,
    public gitBranch?: string,
    public keysGenerated?: boolean
  ) {}
}

export interface IBuildRequest {
  buildid?: string;
  gitRepoUrl?: string;
  gitBranch?: string;
  publicKey?: string;
  keysGenerated?: boolean;
}

export class BuildRequest implements IBuildRequest {
  constructor(
    public buildid?: string,
    public gitRepoUrl?: string,
    public gitBranch?: string,
    public publicKey?: string,
    public keysGenerated?: boolean
  ) {}
}

export interface IBuildCreateUpdateRequest {
  uuid?: string;
  name?: string;
  status?: string;
  buildid?: number;
  message?: string;
  url?: string;
  projectUuid?: string;
  environment?: any;
  gitRepoUrl?: string;
  gitBranch?: string;
  keysGenerated?: boolean;
  publicKey?: string;
  buildEnvConfigurations?: IBuildEnvConf[];
}

export class BuildCreateUpdateRequest implements IBuildCreateUpdateRequest {
  constructor(
    public uuid?: string,
    public name?: string,
    public status?: string,
    public buildid?: number,
    public message?: string,
    public url?: string,
    public projectUuid?: string,
    public environment?: any,
    public gitRepoUrl?: string,
    public gitBranch?: string,
    public publicKey?: string,
    public keysGenerated?: boolean,
    public buildEnvConfigurations?: IBuildEnvConf[]
  ) {}
}
