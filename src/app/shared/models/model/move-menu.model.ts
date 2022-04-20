import { IMainMenu } from '@shared/models/model/main-menu.model';

export interface IMoveMainMenu {
  moveFromMenu?: IMainMenu;
  moveToMenu?: IMainMenu;
}

export class MoveMainMenu implements IMoveMainMenu {
  constructor(public moveFromMenu?: IMainMenu, public moveToMenu?: IMainMenu) {}
}
