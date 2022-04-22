export interface IEnvironmentStatus {
  git?: string;
  docker?: string;
  deployment?: string;
}

export class EnvironmentStatus implements IEnvironmentStatus {
  constructor(public git?: string, public docker?: string, public deployment?: string) {}
}
