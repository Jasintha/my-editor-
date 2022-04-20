import { IPage } from '@shared/models/model/page.model';

export interface IPageConfig {
  uuid?: string;
  pageConfigs?: IConfig[];
  page?: IPage;
  projectUuid?: string;
}

export class PageConfig implements IPageConfig {
  constructor(public uuid?: string, public pageConfigs?: IConfig[], public page?: IPage, public projectUuid?: string) {}
}

export interface IConfig {
  id?: number;
  component?: string;
  property?: string;
  property_value?: string;
}

export class Config implements IConfig {
  constructor(public id?: number, public component?: string, public property?: string, public property_value?: string) {}
}
