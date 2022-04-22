import { IPage } from './page.model';
import { IMainMenu } from './main-menu.model';

export interface ISubMenu {
  uuid?: string;
  name?: string;
  icon?: string;
  page?: IPage;
  mainmenu?: IMainMenu;
  projectUuid?: string;
  status?: string;
}

export class SubMenu implements ISubMenu {
  constructor(
    public uuid?: string,
    public name?: string,
    public icon?: string,
    public page?: IPage,
    public mainmenu?: IMainMenu,
    public projectUuid?: string,
    public status?: string
  ) {}
}
