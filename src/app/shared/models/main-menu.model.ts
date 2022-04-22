import { IDatamodel } from './model/datamodel.model';
import { IPage } from './model/page.model';
import { ISubMenu } from './model/sub-menu.model';

export interface IMainMenu {
  uuid?: string;
  name?: string;
  menuType?: string;
  icon?: string;
  page?: IPage;
  datamodel?: IDatamodel;
  submenus?: ISubMenu[];
  projectUuid?: string;
  status?: string;
}

export class MainMenu implements IMainMenu {
  constructor(
    public uuid?: string,
    public name?: string,
    public menuType?: string,
    public icon?: string,
    public page?: IPage,
    public submenus?: ISubMenu[],
    public datamodel?: IDatamodel,
    public projectUuid?: string,
    public status?: string
  ) {}
}
