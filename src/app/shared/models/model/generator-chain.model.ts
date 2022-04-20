export interface IGeneratorComponents {
  id?: string;
  name?: string;
  type?: string;
  active?: boolean;
  lang?: string;
  target?: string;
}

export class GeneratorComponents implements IGeneratorComponents {
  constructor(
    public id?: string,
    public name?: string,
    public type?: string,
    public active?: boolean,
    public lang?: string,
    public target?: string
  ) {}
}

export interface IGenerator {
  position?: number;
  generator?: IGeneratorComponents;
}

export class Generator implements IGenerator {
  constructor(public position?: number, public generator?: IGeneratorComponents) {}
}
