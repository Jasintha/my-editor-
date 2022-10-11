import {IPropertyKeyValue} from '@shared/models/model/property-key-value.model';

export interface ITheme {
  uuid?: string;
  default?: boolean;
  name?: string;
  themestyle?: string;
  inputStyle?: string;
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
    public app?: IPropertyKeyValue[],
    public page?: IPropertyKeyValue[],
    public pageController?: IPropertyKeyValue[],
  ) {}
}
