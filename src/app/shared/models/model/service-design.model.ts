export interface IServiceDesign {
  uuid?: string;
  name?: string;
  description?: string;
  namespace?: string;
  version?: string;
  projecttype?: string;
  interalRepoAccUUID?: string;
  dockerHubAccUUID?: string;
  projectUuid?: string;
  generated?: boolean;
}

export class ServiceDesign implements IServiceDesign {
  constructor(
    public uuid?: string,
    public name?: string,
    public description?: string,
    public namespace?: string,
    public projecttype?: string,
    public interalRepoAccUUID?: string,
    public dockerHubAccUUID?: string,
    public projectUuid?: string,
    public generated?: boolean
  ) {}
}
