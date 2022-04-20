import { IProject } from '@shared/models/model/project.model';

export interface IMmpmodule {
  uuid?: string;
  modulename?: string;
  installedproject?: IProject;
  installedprojectUuid?: string;
  projectUuid?: string;
  status?: string;
}

export class Mmpmodule implements IMmpmodule {
  constructor(
    public uuid?: string,
    public modulename?: string,
    public installedproject?: IProject,
    public installedprojectUuid?: string,
    public projectUuid?: string,
    public status?: string
  ) {}
}
