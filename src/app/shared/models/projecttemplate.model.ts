export interface IProjecttemplate {
  id?: number;
  name?: string;
  conf?: string;
}

export class Projecttemplate implements IProjecttemplate {
  constructor(public id?: number, public name?: string, public conf?: string) {}
}
