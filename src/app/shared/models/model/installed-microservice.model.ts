import { IProject } from '@shared/models/model/project.model';

export interface IMicroservice {
  name?: string;
  filepath?: string;
  apis?: string[];
}

export class Microservice implements IMicroservice {
  constructor(public name?: string, public filepath?: string, public apis?: string[]) {}
}

export interface IInstalledMicroservice {
  uuid?: string;
  name?: string;
  filepath?: string;
  status?: string;
  project?: IProject;
}

export class InstalledMicroservice implements IInstalledMicroservice {
  constructor(public uuid?: string, public name?: string, public filepath?: string, public status?: string, public project?: IProject) {}
}
