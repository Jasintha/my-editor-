export interface IProjectImportMetadata {
  repoName?: string;
  projectName?: string;
  projectMasterUID?: string;
  apptype?: string;
  projectType?: string;
  organization?: string;
  version?: string;
}

export class ProjectImportMetadata implements IProjectImportMetadata {
  constructor(
    public repoName?: string,
    public projectName?: string,
    public projectMasterUID?: string,
    public apptype?: string,
    public projectType?: string,
    public organization?: string,
    public version?: string
  ) {}
}
