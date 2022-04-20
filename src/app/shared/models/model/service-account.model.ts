export interface IServiceAccount {
  uuid?: string;
  name?: string;
  accountType?: string;
  scope?: string;
  createdby?: string;
  // publicKey?: string;
  // privateKey?: string;
  valid?: boolean;
  gitAccount?: IGitAccountData;
  dockerAccount?: IDockerAccountData;
  keyFile?: string;
}

export class ServiceAccount implements IServiceAccount {
  constructor(
    public uuid?: string,
    public name?: string,
    public accountType?: string,
    public scope?: string,
    public createdby?: string,
    // public publicKey?: string,
    // public privateKey?: string,
    public valid?: boolean,
    public gitAccount?: IGitAccountData,
    public keyFile?: string
  ) {}
}

export interface IGitAccountData {
  accessToken?: string;
  organization?: string;
  owner?: string;
  baseURL?: string;
}

export class GitAccountData implements IGitAccountData {
  constructor(public accessToken?: string, public organization?: string, public owner?: string, public baseURL?: string) {}
}

export interface IDockerAccountData {
  accessToken?: string;
  username?: string;
}

export class DockerAccountData implements IDockerAccountData {
  constructor(public accessToken?: string, public username?: string) {}
}
