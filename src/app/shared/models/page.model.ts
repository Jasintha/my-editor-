import { IView } from './model/view.model';
import { IDatamodel } from './model/datamodel.model';
import { IPageConfig } from './model/page-config.model';
import { IPageAction } from './model/page-action.model';
import { IProject } from './model/project.model';
import { IAPIInput } from './model/api-input.model';
import { IAggregate } from './model/aggregate.model';


export interface IPage {
  uuid?: string;
  pagetitle?: string;
  pageRefId?: string;
  pagetype?: string;
  pagetemplate?: string;
  views?: IView[];
  projectUuid?: string;
  authority?: string;
  datamodel?: IDatamodel;
  pageConfig?: IPageConfig;
  pageActions?: IPageAction[];
  linkRegistration?: boolean;
  status?: string;
  noOfPillars?: number;
  microservice?: IProject;
  apiType?: string;
  api?: any;
  command?: any;
  query?: any;
  operation?: string;
  params?: IAPIInput[];
  resourcePath?: string;
  model?: any;
  apiResourceDetails?: any[];
  dashboardPanelDetails?: any[];
  loginParams?: any[];
  uiTemplate?: string;
  uiTemplateImage?: string;
  stepHeaders?: any[];
  stepMappings?: any[];
  pagestyle?: string;
  isHomepage?: boolean;
  pageViewType?: string;
  pageGrid?: any;
}

export class Page implements IPage {
  constructor(
    public uuid?: string,
    public pagetitle?: string,
    public pageRefId?: string,
    public pagetype?: string,
    public pagetemplate?: string,
    public views?: IView[],
    public authority?: string,
    public projectUuid?: string,
    public datamodel?: IDatamodel,
    public pageConfig?: IPageConfig,
    public pageActions?: IPageAction[],
    public linkRegistration?: boolean,
    public status?: string,
    public noOfPillars?: number,
    public microservice?: IProject,
    public api?: any,
    public apiType?: string,
    public command?: any,
    public query?: any,
    public operation?: string,
    public params?: IAPIInput[],
    public resourcePath?: string,
    public model?: IAggregate,
    public apiResourceDetails?: any[],
    public dashboardPanelDetails?: any[],
    public loginParams?: any[],
    public uiTemplate?: string,
    public uiTemplateImage?: string,
    public stepHeaders?: any[],
    public stepMappings?: any[],
    public pagestyle?: string,
    public isHomepage?: boolean,
    public pageViewType?: string,
    public pageGrid?: any
  ) {}
}
