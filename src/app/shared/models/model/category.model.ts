import { ISolution } from '@shared/models/model/solution.model';
import { ISolutiontemplate } from '@shared/models/model/solutiontemplate.model';

export interface ICategory {
  id?: number;
  name?: string;
  solutions?: ISolution[];
  solutiontemplates?: ISolutiontemplate[];
}

export class Category implements ICategory {
  constructor(public id?: number, public name?: string, public solutions?: ISolution[], public solutiontemplates?: ISolutiontemplate[]) {}
}
