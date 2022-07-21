import { IPage } from '@shared/models/model/page.model';

export interface IPageNavigation {
  uuid?: string;
  event?: string;
  fromPage?: IPage;
  toPage?: IPage;
  pageParams?: IPageParam[];
  projectUuid?: string;
}

export class PageNavigation implements IPageNavigation {
  constructor(
    public uuid?: string,
    public event?: string,
    public fromPage?: IPage,
    public toPage?: IPage,
    public pageParams?: IPageParam[],
    public projectUuid?: string
  ) {}
}

export interface IPageParam {
  name?: string;
  propertyName?: string;
}

export class PageParam implements IPageParam {
  constructor(public name?: string, public propertyName?: string) {}
}


export interface INavigationParam {
  name?: string;
  value?: string;
}

export class NavigationParam implements INavigationParam {
  constructor(public name?: string, public value?: string) {}
}