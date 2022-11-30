import { IPage } from '@shared/models/model/page.model';
import { ISubMenu } from '@shared/models/model/sub-menu.model';
import { IDatamodel } from '@shared/models/model/datamodel.model';

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
  position?: string;
  customRoles?: string;
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
    public status?: string,
    public position?: string,
    public customRoles?: string,
  ) {}
}
