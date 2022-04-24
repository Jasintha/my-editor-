import { ICredential } from './credential.model';
import { IAuthority } from './authority.model';

export interface IUser {
  ID?: any;
  additionalInfo?: string;
  customerId?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  credential?: ICredential;
  authority?: IAuthority;
  tenant?: ITenant;
}

export class User implements IUser {
  constructor(
    public ID?: any,
    public additionalInfo?: string,
    public customerId?: number,
    public email?: string,
    public firstName?: string,
    public lastName?: string,
    public credential?: ICredential,
    public authority?: IAuthority
  ) {
    this.ID = ID ? ID : null;
    this.additionalInfo = additionalInfo ? additionalInfo : null;
    this.firstName = firstName ? firstName : null;
    this.lastName = lastName ? lastName : null;
    this.email = email ? email : null;
    this.credential = credential ? credential : null;
    this.authority = authority ? authority : null;
  }
}

export interface ITenant {
  ID?: any;
  name?: string;
  organization?: number;
  email?: string;
  address?: string;
  phone?: string;
  enable?: number;
}

export interface IUserDetails {
  ID?: any;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  status?: number;
  role?: string;
}
