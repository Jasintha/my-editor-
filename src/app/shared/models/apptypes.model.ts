export interface IApptypes {
  id?: number;
  name?: string;
  conf?: string;
}

export class Apptypes implements IApptypes {
  constructor(public id?: number, public name?: string, public conf?: string) {}
}
