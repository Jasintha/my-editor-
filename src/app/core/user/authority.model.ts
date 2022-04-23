export interface IAuthority {
  id?: any;
  authorityName?: string;
  userId?: number;
}

export class Authority implements IAuthority {
  constructor(public id?: any, public authorityName?: string, public userId?: number) {
    this.id = id ? id : null;
    this.authorityName = authorityName ? authorityName : null;
  }
}
