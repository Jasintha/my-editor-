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
    uuid?: string;
    tabPages?: ITabPage[];
}

export class TabbedPage implements ITabbedPage {
    constructor( public uuid?: string, public tabPages?: ITabPage[]) {}
}
