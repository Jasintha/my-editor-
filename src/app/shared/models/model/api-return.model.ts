export interface IAPIReturn {
  id?: string;
  success?: string;
  fail?: string;
}

export class APIReturn implements IAPIReturn {
  constructor(public id?: string, public success?: string, public fail?: string) {}
}
