import { IInputProperty } from '@shared/models/model/input-property.model';

export interface ICustomObject {
  uuid?: string;
  name?: string;
  description?: string;
  projectUuid?: string;
  inputProperties?: IInputProperty;
  status?: string;
}

export class CustomObject implements ICustomObject {
  constructor(public uuid?: string, public name?: string, public description?: string, public projectUuid?: string, public status?: string) {}
}
