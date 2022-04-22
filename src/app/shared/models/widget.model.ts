import { IView } from './view.model';
import { IDatamodel } from './datamodel.model';
import { IPageConfig } from './page-config.model';
import { IPageAction } from './page-action.model';
import { IProject } from './project.model';
import { IAPIInput } from './api-input.model';
import { IAggregate } from './aggregate.model';


export interface IWidget {
  uuid?: string;
  pageUuid?: string;
  projectUuid?: string;
  widgetTitle?: string;
  widgetRefId?: string;
  widgettype?: string;
  widgettemplate?: string;
  views?: IView[];
  authority?: string;
  datamodel?: IDatamodel;
  widgetConfig?: IPageConfig;
  widgetActions?: IPageAction[];
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
}

export class Widget implements IWidget {
  constructor(
    public uuid?: string,
    public pageUuid?: string,
    public projectUuid?: string,
    public widgetTitle?: string,
    public widgetRefId?: string,
    public widgettype?: string,
    public widgettemplate?: string,
    public views?: IView[],
    public authority?: string,
    public datamodel?: IDatamodel,
    public widgetConfig?: IPageConfig,
    public widgetActions?: IPageAction[],
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
    public stepMappings?: any[]
  ) {}
}
