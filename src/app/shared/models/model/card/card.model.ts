import { IRequirement } from 'app/shared/model/requirement.model';

export interface CardInterface {
  id?: string;
  name?: string;
  type?: string;
  header?: string;
  summary?: string;
  description?: string;
  requirement?: IRequirement;
  epic?: any;
}

export class Card implements CardInterface {
  constructor(
    public id?: string,
    public name?: string,
    public type?: string,
    public header?: string,
    public summary?: string,
    public description?: string,
    public requirement?: IRequirement,
    public epic?: any
  ) {}
}
