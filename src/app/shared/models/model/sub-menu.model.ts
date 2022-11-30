import { IPage } from '@shared/models/model/page.model';
import { IMainMenu } from '@shared/models/model/main-menu.model';

export interface ISubMenu {
  uuid?: string;
  name?: string;
  icon?: string;
  page?: IPage;
  mainmenu?: IMainMenu;
  projectUuid?: string;
  status?: string;
  position?: string;
  customRoles?: string;
}

export class SubMenu implements ISubMenu {
  constructor(
    public uuid?: string,
    public name?: string,
    public icon?: string,
    public page?: IPage,
    public mainmenu?: IMainMenu,
    public projectUuid?: string,
    public status?: string,
    public position?: string,
    public customRoles?: string,
  ) {}
}
