export interface IReleaseConfigReq {
  devEnvironmentID?: number;
  prodEnvironmentID?: number;
  manualTrigger?: boolean;
}

export class ReleaseConfigReq implements IReleaseConfigReq {
  constructor(public devEnvironmentID?: number, public prodEnvironmentID?: number, public manualTrigger?: boolean) {}
}
