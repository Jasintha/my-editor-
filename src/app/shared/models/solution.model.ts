import { ISolutiontemplate } from './model/solutiontemplate.model';
import { IProject } from './model/project.model';
import { ICategory } from './model/category.model';


export interface ISolution {
  id?: number;
  name?: string;
  version?: string;
  description?: string;
  template?: ISolutiontemplate;
  projects?: IProject[];
  solutioncategory?: ICategory;
  templateKey?: string;
}

export class Solution implements ISolution {
  constructor(
    public id?: number,
    public name?: string,
    public version?: string,
    public description?: string,
    public template?: ISolutiontemplate,
    public projects?: IProject[],
    public solutioncategory?: ICategory,
    public templateKey?: string
  ) {}
}
