import { IPage } from '@shared/models/model/page.model';

export interface IPageAction {
  uuid?: string;
  name?: string;
  actionType?: string;
  event?: string;
  page?: IPage;
  pageActionParams?: IPageActionParam[];
  projectUuid?: string;
}

export class PageAction implements IPageAction {
  constructor(
    public uuid?: string,
    public name?: string,
    public actionType?: string,
    public event?: string,
    public page?: IPage,
    public pageActionParams?: IPageActionParam[],
    public projectUuid?: string
  ) {}
}

export interface IPageActionParam {
  name?: string;
  targetPropertyName?: string;
}

export class PageActionParam implements IPageActionParam {
  constructor(public name?: string, public targetPropertyName?: string) {}
}
