import { ICategory } from './category.model';


export interface ISolutiontemplate {
  id?: number;
  name?: string;
  conf?: string;
  category?: ICategory;
}

export class Solutiontemplate implements ISolutiontemplate {
  constructor(public id?: number, public name?: string, public conf?: string, public category?: ICategory) {}
}
