export interface ICreateFolderStatus {
  projectid?: number;
  status?: string;
}

export class CreateFolderStatus implements ICreateFolderStatus {
  constructor(public projectid?: number, public status?: string) {}
}

export interface IMMPJobStatusResponse {
  fullName?: string;
  name?: string;
  isexist?: boolean;
  inqueue?: boolean;
  disabled?: boolean;
  status?: string;
}

export class MMPJobStatusResponse implements IMMPJobStatusResponse {
  constructor(
    public fullName?: string,
    public name?: string,
    public isexist?: boolean,
    public inqueue?: boolean,
    public disabled?: boolean,
    public status?: string
  ) {}
}
