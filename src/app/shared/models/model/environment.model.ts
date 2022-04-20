import { IDeploymentConfiguration } from '@shared/models/model/deployment-configuration.model';
import { IGitConfiguration } from '@shared/models/model/git-configuration.model';
import { IDockerConfiguration } from '@shared/models/model/docker-configuration.model';
import { IEnvironmentStatus } from '@shared/models/model/environment-status.model';

export interface IEnvironment {
  id?: number;
  type?: string;
  templateType?: string;
  active?: string;
  status?: IEnvironmentStatus;
  //solution?: ISolution;
  gitConfig?: IGitConfiguration;
  dockerConfig?: IDockerConfiguration;
  deploymentConfig?: IDeploymentConfiguration;
  otherServices?: IDockerConfiguration[];
  uuid?: string;
  name?: string;
  provider?: string;
  providerName?: string;
  keyfile?: string;
  vtype?: string;
  mstatus?: string;
  repouuid?: string;
  kubernetesRepo?: string;
  ingress?: string;
  scope?: string;
  details?: IData[];
}

export class Environment implements IEnvironment {
  constructor(
    public id?: number,
    public type?: string,
    public active?: string,
    public status?: IEnvironmentStatus,
    //public solution?: ISolution,
    public gitConfig?: IGitConfiguration,
    public dockerConfig?: IDockerConfiguration,
    public deploymentConfig?: IDeploymentConfiguration,
    public otherServices?: IDockerConfiguration[],
    public uuid?: string,
    public name?: string,
    public provider?: string,
    public providerName?: string,
    public keyfile?: string,
    public vtype?: string,
    public mstatus?: string,
    public repouuid?: string,
    public kubernetesRepo?: string,
    public ingress?: string,
    public scope?: string,
    public details?: IData[]
  ) {}
}

export interface IEnvironmentItem {
  creationTimestamp?: string;
  description?: string;
  guestCpus?: number;
  id?: string;
  kind?: string;
  maximumPersistentDisks?: number;
  MaximumPersistentDisksSizeGb?: string;
  memoryMb?: number;
  name?: string;
  selfLink?: string;
  zone?: string;
}

export class EnvironmentItem implements IEnvironmentItem {
  constructor(
    public creationTimestamp?: string,
    public description?: string,
    public guestCpus?: number,
    public id?: string,
    public kind?: string,
    public maximumPersistentDisks?: number,
    public MaximumPersistentDisksSizeGb?: string,
    public memoryMb?: number,
    public name?: string,
    public selfLink?: string,
    public zone?: string
  ) {}
}

export interface IEnvironmentRuntime {
  name?: string;
  type?: string;
  thumbnail?: string;
  fields?: string[];
}

export class EnvironmentRuntime implements IEnvironmentRuntime {
  constructor(public name?: string, public type?: string, public thumbnail?: string, public fields?: string[]) {}
}

export interface IProjectEnvironmentStatus {
  devEnvStatus?: string;
  prodEnvStatus?: string;
}

export class ProjectEnvironmentStatus implements IProjectEnvironmentStatus {
  constructor(public devEnvStatus?: string, public prodEnvStatus?: string) {}
}

export interface IEnvironmentReq {
  id?: number;
  uuid?: string;
  type?: string;
  name?: string;
  provider?: string;
  providerName?: string;
  description?: string;
  keyfile?: string;
  vtype?: string;
  mstatus?: string;
  repouuid?: string;
  kubernetesRepo?: string;
  ingress?: string;
  scope?: string;
  baseURL?: string;
}

export class EnvironmentReq implements IEnvironmentReq {
  constructor(
    public id?: number,
    public uuid?: string,
    public type?: string,
    public name?: string,
    public description?: string,
    public provider?: string,
    public providerName?: string,
    public keyfile?: string,
    public vtype?: string,
    public mstatus?: string,
    public repouuid?: string,
    public kubernetesRepo?: string,
    public ingress?: string,
    public scope?: string,
    public baseURL?: string
  ) {}
}
export interface IData {
  header?: string;
  value?: string;
  style?: string;
}

export class Data implements IData {
  constructor(public header?: string, public value?: string, public style?: string) {}
}

export interface IEnvProperty {
  uuid?: string;
  envKeyMappings?: any[];
  envuuid?: string;
}

export class EnvProperty implements IEnvProperty {
  constructor(public uuid?: string, public envKeyMappings?: any[], public envuuid?: string) {}
}

export interface IApplicationReq {
  id?: number;
  uuid?: string;
  envuuid?: string;
  type?: string;
  name?: string;
  port?: number;
  grpcPort?: number;
  environment?: string;
  projectMasterUID?: string;
  envKeyMappings?: any;
  branch?: string;
  sourceRepo?: string;
  repotype?: string;
  branchtype?: string;
  revision?: string;
  path?: string;
  swaggerDocAvailable?: boolean;
  swaggerLink?: string;
  apptype?: string;
  appTypesId?: string;
  contextRoot?: string;
}

export class ApplicationReq implements IApplicationReq {
  constructor(
    public id?: number,
    public uuid?: string,
    public envuuid?: string,
    public type?: string,
    public name?: string,
    public keytype?: string,
    public port?: number,
    public grpcPort?: number,
    public environment?: string,
    public projectMasterUID?: string,
    public envKeyMappings?: string,
    public branch?: string,
    public sourceRepo?: string,
    public repotype?: string,
    public branchtype?: string,
    public revision?: string,
    public path?: string,
    public swaggerDocAvailable?: boolean,
    public swaggerLink?: string,
    public apptype?: string,
    public appTypesId?: string,
    public contextRoot?: string
  ) {}
}
