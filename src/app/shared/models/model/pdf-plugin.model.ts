import { IProject } from '@shared/models/model/project.model';
export interface IPdf {
  id?: number;
  name?: string;
  type?: string;
  description?: string;
  project?: IProject;
  status?: string;
}

export class PdfPluginModel implements IPdf {
  constructor(
    public id?: number,
    public name?: string,
    public type?: string,
    public description?: string,
    public project?: IProject,
    public status?: string
  ) {}
}
