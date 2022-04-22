export interface IAPIRule {
  name?: string;
  ruleId?: string;
}

export class APIRule implements IAPIRule {
  constructor(public name?: string, public ruleId?: string) {}
}
