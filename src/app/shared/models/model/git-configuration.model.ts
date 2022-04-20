export interface IGitConfiguration {
  provider?: string;
  gitusername?: string;
  gitPassword?: string;
  accessToken?: string;
}

export class GitConfiguration implements IGitConfiguration {
  constructor(public provider?: string, public gitusername?: string, public gitPassword?: string, public accessToken?: string) {}
}
