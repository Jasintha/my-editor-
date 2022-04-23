export interface ICredential {
  id?: any;
  activateToken?: string;
  password?: string;
  resetToken?: string;
  enable?: number;
  userId?: number;
  username?: string;
}

export class Credential implements ICredential {
  constructor(
    public id?: any,
    public activateToken?: string,
    public password?: string,
    public resetToken?: string,
    public enable?: number,
    public userId?: number,
    public username?: string
  ) {
    this.id = id ? id : null;
    this.activateToken = activateToken ? activateToken : null;
    this.password = password ? password : null;
    this.resetToken = resetToken ? resetToken : null;
    this.username = username ? username : null;
  }
}
