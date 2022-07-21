import { IView } from '@shared/models/model/view.model';
import { IProject } from '@shared/models/model/project.model';
import { IDatamodel } from '@shared/models/model/datamodel.model';
import { IAggregate } from '@shared/models/model/aggregate.model';
import { IPageConfig } from '@shared/models/model/page-config.model';
import { IPageAction } from '@shared/models/model/page-action.model';
import { IAPIInput } from '@shared/models/model/api-input.model';
import {IActions, IButtonType} from '@shared/models/model/button-type.model';
import {IChartDetails} from '@shared/models/model/chart-details.model';
import {INavigationParam} from '@shared/models/model/page-navigation.model';

export interface IPage {
  uuid?: string;
  pagetitle?: string;
  pageDescription?: string;
  pageRefId?: string;
  pagetype?: string;
  attachedPage?: string;
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
  apiDataArray?: any;
  attachedPageLocation?: string;
  actions?: IActions;
  rowHeaders?: any[];
  rowMappings?: any[];
  tabLayout?: string;
  chartDetails?: IChartDetails;
  navigationParams?: INavigationParam[];
}

export class Page implements IPage {
  constructor(
    public uuid?: string,
    public pagetitle?: string,
    public pageDescription?: string,
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
    public attachedPage?: string,
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
    public pageGrid?: any,
    public apiDataArray? : any,
    public attachedPageLocation? : string,
    public actions? : IActions,
    public rowHeaders?: any[],
    public rowMappings?: any[],
    public tabLayout?: string,
    public chartDetails?: IChartDetails,
    public navigationParams?: INavigationParam[],
  ) {}
}
