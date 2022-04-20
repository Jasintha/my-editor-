import { ISolution } from '@shared/models/model/solution.model';
import { IProjecttemplate } from '@shared/models/model/projecttemplate.model';
import { IApptypes } from '@shared/models/model/apptypes.model';
import { IDatamodel } from '@shared/models/model/datamodel.model';
import { ILink } from '@shared/models/model/link.model';
import { IRuleproxy } from '@shared/models/model/ruleproxy.model';
import { IInputProperty } from '@shared/models/model/input-property.model';
import { IApi } from '@shared/models/model/api.model';
import { IEntityapi } from '@shared/models/model/entityapi.model';
import { IView } from '@shared/models/model/view.model';
import { ICustomObject } from '@shared/models/model/custom-object.model';
import { IPage } from '@shared/models/model/page.model';
import { ISubMenu } from '@shared/models/model/sub-menu.model';
import { IMainMenu } from '@shared/models/model/main-menu.model';
import { IPageNavigation } from '@shared/models/model/page-navigation.model';
import { IAggregate } from '@shared/models/model/aggregate.model';
import { IViewmodel } from '@shared/models/model/viewmodel.model';
import { ICommand } from '@shared/models/model/command.model';
import { IEvent } from '@shared/models/model/microservice-event.model';
import { IEnvironment } from '@shared/models/model/environment.model';
import { IPanel } from '@shared/models/model/panel.model';
import { IDatasource } from '@shared/models/model/datasource.model';
import { ISubrule } from '@shared/models/model/subrule.model';

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
