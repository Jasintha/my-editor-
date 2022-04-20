import { IRuntime } from '@shared/models/model/runtime.model';

export interface IDeploymentConfiguration {
  vendor?: string;
  clusterName?: string;
  description?: string;
  diskSize?: number;
  diskType?: string;
  machineType?: string;
  serviceAccount?: string;
  zone?: string;
  runtimes?: IRuntime[];
}

export class DeploymentConfiguration implements IDeploymentConfiguration {
  constructor(
    public vendor?: string,
    public clusterName?: string,
    public description?: string,
    public diskSize?: number,
    public diskType?: string,
    public machineType?: string,
    public serviceAccount?: string,
    //public port?: string,
    //public serviceName?: string,
    //public targetPort?: string,
    public zone?: string,
    //public databaseConfigurations?: IDatabaseConfiguration[]
    public runtimes?: IRuntime[]
  ) {}
}
