
export interface IApiGatewayConfiguration {
  uuid?: string;
  modulename?: string;
  port?: number;
  grpcPort?: number;
  requestPath?: string;
  rewriteRule?: string;
  contextRoot?: string;
  installedprojectUuid?: string;
  projectUuid?: string;
  allproperties?: IApiGatewayConfigProperties[];
}

export class ApiGatewayConfiguration implements IApiGatewayConfiguration {
  constructor(
    public uuid?: string,
    public modulename?: string,
    public port?: number,
    public grpcPort?: number,
    public requestPath?: string,
    public contextRoot?: string,
    public rewriteRule?: string,
    public installedprojectUuid?: string,
    public projectUuid?: string,
    public allproperties?: IApiGatewayConfigProperties[]
  ) {}
}

export interface IApiGatewayConfigProperties {
  key?: string;
  value?: string;
}

export class ApiGatewayConfigProperties implements IApiGatewayConfigProperties {
  constructor(public key?: string, public value?: string) {}
}
