
export interface IDatabaseConfiguration {
  scope?: string;
  type?: string;
  dialect?: string;
  protocol?: number;
  host?: string;
  port?: string;
  user?: string;
  password?: string;
}

export class DatabaseConfiguration implements IDatabaseConfiguration {
  constructor(
    public scope?: string,
    public type?: string,
    public dialect?: string,
    public protocol?: number,
    public host?: string,
    public port?: string,
    public user?: string,
    public password?: string
  ) {}
}
