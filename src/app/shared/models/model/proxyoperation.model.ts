export interface IProxyoperation {
  id?: number;
  name?: string;
  opConfig?: string;
}

export class Proxyoperation implements IProxyoperation {
  constructor(public id?: number, public name?: string, public opConfig?: string) {}
}
