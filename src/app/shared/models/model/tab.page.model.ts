import { IPage } from '@shared/models/model/page.model';

export interface ITabPage {
    id?: string;
    tabName?: string;
    page?: IPage;
}

export class TabPage implements ITabPage {
    constructor(
        public id?: string,
        public tabName?: string,
        public page?: IPage) {}
}


export interface ITabbedPage {
    pagetitle?: string;
    pageRefId?: string;
    pagetype?: string;
    pagetemplate?: string;
    projectUuid?: string;
    authority?: string;
    uuid?: string;
    tabPages?: ITabPage[];
    pageViewType?: string;
    status?: string;
}

export class TabbedPage implements ITabbedPage {
    constructor(
        public pagetitle?: string,
        public pageRefId?: string,
        public pagetype?: string,
        public pagetemplate?: string,
        public projectUuid?: string,
        public authority?: string,
        public uuid?: string,
        public tabPages?: ITabPage[],
        public pageViewType?:  string,
        public status?: string
    ) {}
}
