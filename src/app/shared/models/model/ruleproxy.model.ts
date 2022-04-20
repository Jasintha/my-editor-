
import { IAPIInput } from '@shared/models/model/api-input.model';

export interface IRuleproxy {
  uuid?: string;
  name?: string;
  ruleId?: string;
  projectUuid?: string;
  ruleServiceInputs?: IAPIInput[];
}

export class Ruleproxy implements IRuleproxy {
  constructor(
    public uuid?: string,
    public name?: string,
    public ruleId?: string,
    public projectUuid?: string,
    public ruleServiceInputs?: IAPIInput[]
  ) {}
}
