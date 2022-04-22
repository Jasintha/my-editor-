export interface IFormControllers {
  fieldList?: any;
}

export class FormControllers implements IFormControllers {
  constructor(public fieldList?: string) {}
}
