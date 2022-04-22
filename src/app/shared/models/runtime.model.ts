export interface IRuntime {
  type?: string;
  name?: string;
  thumbnail?: string;
  user?: string;
  password?: string;
  properties?: IRuntimeProperty[];
}

export class Runtime implements IRuntime {
  constructor(
    public type?: string,
    public name?: string,
    public user?: string,
    public thumbnail?: string,
    public password?: string,
    public properties?: IRuntimeProperty[]
  ) {}
}

export interface IRuntimeProperty {
  key?: string;
  value?: string;
}

export class RuntimeProperty implements IRuntimeProperty {
  constructor(public key?: string, public value?: string) {}
}
