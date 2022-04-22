export interface IStatusChangeRequest {
  id?: number;
  name?: string;
  type?: string;
}

export class StatusChangeRequest implements IStatusChangeRequest {
  constructor(public id?: number, public name?: string, public type?: string) {}
}
