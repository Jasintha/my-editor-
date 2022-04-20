import { IView } from '@shared/models/model/view.model';
import { IProject } from '@shared/models/model/project.model';

export interface ICustomPage {
  uuid?: string;
  pageId?: string;
  pagetype?: string;
  name?: string;
  views?: IView[];
  project?: IProject;
  status?: string;
}

export class CustomPage implements ICustomPage {
  constructor(
    public uuid?: string,
    public pageId?: string,
    public pagetype?: string,
    public name?: string,
    public views?: IView[],
    public project?: IProject,
    public status?: string
  ) {}
}
