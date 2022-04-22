import {IProperty} from "@shared/models/property.model";


export const enum Inputtype {
  PRIVATE = 'private',
  PUBLIC = 'public'
}

export interface IDatamodel {
  uuid?: string;
  name?: string;
  description?: string;
  projectUuid?: string;
  visibility?: Inputtype;
  properties?: IProperty[];
  crudApiList?: string;
  uiList?: string;
  menuType?: string;
  template?: string;
  status?: string;
}

export class Datamodel implements IDatamodel {
  constructor(
    public uuid?: string,
    public name?: string,
    public description?: string,
    public projectUuid?: string,
    public visibility?: Inputtype,
    public properties?: IProperty[],
    public crudApiList?: string,
    public uiList?: string,
    public menuType?: string,
    public template?: string,
    public status?: string
  ) {}
}

/*
ERROR in src/main/webapp/app/entities/datamodel/datamodel-detail.component.html(1,1220): : Property 'properties' does not exist on type 'IDatamodel'.
src/main/webapp/app/entities/datamodel/datamodel-detail.component.html(1,1220): : Property 'trackId' does not exist on type 'DatamodelDetailComponent'.
src/main/webapp/app/entities/project/project-update.component.html(1,883): : Property 'trackApptypesById' does not exist on type 'ProjectUpdateComponent'.



*/
