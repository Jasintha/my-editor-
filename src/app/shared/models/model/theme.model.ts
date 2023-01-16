import {IPropertyKeyValue} from '@shared/models/model/property-key-value.model';

export interface ITheme {
  uuid?: string;
  default?: boolean;
  name?: string;
  themestyle?: string;
  inputStyle?: string;
  portalDisplayName?: string;
  mainLogoUrl?: string;
  buttonTheme?: string;
  layoutorientationRTL?: boolean;
  toolbarposition?: string;
  footerposition?: string;
  footervisibility?: boolean;
  themeselected?: boolean;
  projectUuid?: string;
  primaryColor?: string;
  primaryLightColor?: string;
  primaryMediumColor?: string;
  secondaryColor?: string;
  canvasbackgroundcolor?: string,
  generalfontsize?: number,
  generalfontcolor?: string,
  generalfontweight?: number,
  generalpagewidth?: string,
  sidebarfontsize?: number,
  sidebarfontcolor?: string,
  sidebarfontweight?: number,
  secondaryMediumColor?: string;
  app?: IPropertyKeyValue[];
  page?: IPropertyKeyValue[];
  pageController?: IPropertyKeyValue[];
}

export class Theme implements ITheme {
  constructor(
    public uuid?: string,
    public name?: string,
    public useDefaultTheme?: boolean,
    public themestyle?: string,
    public inputStyle?: string,
    public portalDisplayName?: string,
    public mainLogoUrl?: string,
    public buttonTheme?: string,
    public layoutorientationRTL?: boolean,
    public toolbarposition?: string,
    public footerposition?: string,
    public footervisibility?: boolean,
    public themeselected?: boolean,
    public projectUuid?: string,
    public primaryColor?: string,
    public primaryLightColor?: string,
    public primaryMediumColor?: string,
    public secondaryColor?: string,
    public secondaryMediumColor?: string,
    public canvasbackgroundcolor?: string,
    public generalfontsize?: number,
    public generalfontcolor?: string,
    public generalfontweight?: number,
    public generalpagewidth?: string,
    public sidebarfontsize?: number,
    public sidebarfontcolor?: string,
    public sidebarfontweight?: number,
    public app?: IPropertyKeyValue[],
    public page?: IPropertyKeyValue[],
    public pageController?: IPropertyKeyValue[],
  ) {}
}
