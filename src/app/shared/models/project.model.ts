import { IDatamodel } from './model/datamodel.model';
import { IEntityapi } from './model/entityapi.model';
import { ILink } from './model/link.model';
import { IRuleproxy } from './model/ruleproxy.model';
import { IInputProperty } from './model/input-property.model';
import { IApi } from './model/api.model';
import { IView } from './model/view.model';
import { ICustomObject } from './model/custom-object.model';
import { IPage } from './page.model';
import {ISubMenu} from "@shared/models/sub-menu.model";
import {IPageNavigation} from "@shared/models/page-navigation.model";
import {IEnvironment} from "@shared/models/environment.model";
import { IMainMenu } from './model/main-menu.model';
import { ISubrule } from './subrule.model';
import { IAggregate } from './aggregate.model';
import { IViewmodel } from './viewmodel.model';
import { IEvent } from './event.model';
import { IPanel } from './panel.model';
import { IDatasource } from './datasource.model';
import { IApptypes } from './apptypes.model';


export interface IProject {
  //id?: number;
  displayName?: string;
  name?: string;
  namespace?: string;
  version?: string;
  contextRoot?: string;
  description?: string;
  //solution?: ISolution;
  template?: string;
  apptypesID?: string;
  //eventSource?: string;
  //isCqrsEnabled?: boolean;
  //commandDb?: string;
  //queryDb?: string;
  //projection?: string;
  datamodels?: IDatamodel[];
  entityapis?: IEntityapi[];
  links?: ILink[];
  ruleproxies?: IRuleproxy[];
  inputProperties?: IInputProperty[];
  apis?: IApi[];
  customObjects?: ICustomObject[];
  views?: IView[];
  pages?: IPage[];
  mainmenus?: IMainMenu[];
  submenus?: ISubMenu[];
  subRulevms?: ISubrule[];
  templateKey?: string;
  pageNavigations?: IPageNavigation[];
  aggregates?: IAggregate[];
  viewmodels?: IViewmodel[];
  events?: IEvent[];
  environment?: IEnvironment;
  microserviceApis?: any[];
  commands?: any[];
  queries?: any[];
  //projectDb?: string;
  projecttype?: string;
  //enableEventSourcing?: boolean;
  //enableSecurity?: boolean;
  //statefulService?: boolean;
  genCount?: number;
  panels?: IPanel[];
  datasources?: IDatasource[];
  projectUuid?: string;
  masterUuid?: string;
  interalRepoAccUUID?: string;
  externalRepoAccUUID?: string;
  dockerHubAccUUID?: string;
  sourceRepo?: string;
  themestyle?: string;
  gitRepoURL?: string;
  multiTenancy?: boolean;
}

export class Project implements IProject {
  constructor(
    //public id?: number,
    public name?: string,
    public namespace?: string,
    public contextRoot?: string,
    public displayName?: string,
    public version?: string,
    public description?: string,
    //public solution?: ISolution,
    public template?: string,
    public apptype?: IApptypes,
    //public eventSource?: string,
    //public isCqrsEnabled?: boolean,
    //public commandDb?: string,
    //public queryDb?: string,
    //public projection?: string,
    public datamodels?: IDatamodel[],
    public links?: ILink[],
    public ruleproxies?: IRuleproxy[],
    public inputProperties?: IInputProperty[],
    public apis?: IApi[],
    public entityapis?: IEntityapi[],
    public customObjects?: ICustomObject[],
    public views?: IView[],
    public pages?: IPage[],
    public mainmenus?: IMainMenu[],
    public submenus?: ISubMenu[],
    public subRulevms?: ISubrule[],
    public templateKey?: string,
    public pageNavigations?: IPageNavigation[],
    public aggregates?: IAggregate[],
    public viewmodels?: IViewmodel[],
    public events?: IEvent[],
    public environment?: IEnvironment,
    public microserviceApis?: any[],
    public commands?: any[],
    public queries?: any[],
    //public projectDb?: string,
    public projecttype?: string,
    //public enableEventSourcing?: boolean,
    //public enableSecurity?: boolean,
    //public statefulService?: boolean,
    public genCount?: number,
    public panels?: IPanel[],
    public datasources?: IDatasource[],
    public projectUuid?: string,
    public masterUuid?: string,
    public interalRepoAccUUID?: string,
    public externalRepoAccUUID?: string,
    public dockerHubAccUUID?: string,
    public sourceRepo?: string,
    public themestyle?: string,
    public gitRepoURL?: string,
    public multiTenancy?: boolean
  ) {}
}
