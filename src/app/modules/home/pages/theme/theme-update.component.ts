import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ElementRef,
  QueryList,
} from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
// import { NGXLogger } from 'ngx-logger';
import { FileUpload } from 'primeng/fileupload';
import { ITheme, Theme } from '@shared/models/model/theme.model';
import { ThemeService } from './theme.service';
// import { ToolbarTrackerService } from 'app/core';
import { ProjectService } from '@core/projectservices/project.service';
import { IProject } from '@shared/models/model/project.model';
import { NgxSpinnerService } from 'ngx-spinner';
import {SelectItem} from 'primeng/api';
import {IPropertyKeyValue} from '@shared/models/model/property-key-value.model';

@Component({
  selector: 'virtuan-theme-update',
  templateUrl: './theme-update.component.html',
  styleUrls: ['./theme.scss'],
})
export class ThemeUpdateComponent implements OnDestroy, OnInit {
  @ViewChild('fileInput') fileInput: FileUpload;

  projectUid: string;
  pageId: string;
  @Output() isVisibleEvent = new EventEmitter<boolean>();

  @ViewChild('defaultOpen') defaultOpen: ElementRef;
  element: HTMLElement;
  rowValues: string;
  currentTheme: ITheme;
  themeId: string;
  isSaving: boolean;
  useDefaults: boolean;
  defaultValues = {
    themestyle: 'round',
    inputStyle: 'materialDesign',
    buttonTheme: 'themeStyle1',
    toolbarposition: 'fixed',
    footerposition: 'fixed',
    themeselected: true,
    footervisibility: true,
    primaryColor: '#1a202e',
    primaryLightColor: '#ffffff',
    primaryMediumColor: '#141924',
    secondaryColor: '#5c77ff',
    secondaryMediumColor: '#5c77ff',
  };
  displayAppDialog = false;
  displayPageDialog = false;
  displayPageControlDialog = false;
  headerText: string;
  keytypes: SelectItem[];
  public appPropertyKeyMappings: IPropertyKeyValue[] = [];
  public pagePropertyKeyMappings: IPropertyKeyValue[] = [];
  public pageControlPropertyKeyMappings: IPropertyKeyValue[] = [];
  selectedAppIndex = -1;
  selectedPageIndex = -1;
  selectedPageControlIndex = -1;
  newAppMapping = true;
  newPageMapping = true;
  newPageControlMapping = true;
  // projectId: number;
  project: IProject;
  // projectUid: string;
  fontSizes: SelectItem[] = [
    { label: 'Small', value: 'Small'},
    { label: 'Medium', value: 'Medium'},
    { label: 'Large', value: 'Large'},
  ];

  fontWeights: SelectItem[] = [
    { label: 'bold', value: 'bold'},
    { label: '500', value: '500'},
    { label: '400', value: '400'},
    { label: '300', value: '300'},
    { label: '200', value: '200'},
    { label: '100', value: '100'},
  ];
  editForm = this.fb.group({
    id: [],
    themestyle: [],
    inputStyle: [],
    buttonTheme: [],
    portalDisplayName: [],
    mainLogoUrl: [],
    toolbarposition: [],
    footerposition: [],
    footervisibility: [],
    themeselected: [],
    primaryColor: [],
    primaryLightColor: [],
    primaryMediumColor: [],
    secondaryColor: [],
    secondaryMediumColor: [],
    propkey: [],
    propname: [],
    propvalue: [],
    propdesc: [],

    pagepropkey: [],
    pagepropname: [],
    pagepropvalue: [],
    pagepropdesc: [],

    pagecontrolpropkey: [],
    pagecontrolpropname: [],
    pagecontrolpropvalue: [],
    pagecontrolpropdesc: [],
    canvasbackgroundcolor: [],
    generalfontsize: [],
    generalfontcolor: [],
    generalfontweight: [],
    generalpagewidth: [],

    sidebarfontsize: [],
    sidebarfontcolor: [],
    sidebarfontweight: [],
  });

  constructor(
    // private logger: NGXLogger,
    protected themeService: ThemeService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    // protected toolbarTrackerService: ToolbarTrackerService,
    protected projectService: ProjectService,
    private spinnerService: NgxSpinnerService
  ) {
    // this.toolbarTrackerService.setIsEntityPage('yes');
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params)=> {
      this.projectUid = params.projectUid;
      this.pageId = params.pageUid
      this.getThemeData();
    })   
  }

  getThemeData() {
    const page = this.createFromForm();
    this.themeService
        .findThemesForProjectId(this.projectUid)
        .pipe(
            filter((res: HttpResponse<any>) => res.ok),
            map((res: HttpResponse<any>) => res.body)
        )
        .subscribe(
            (res: ITheme) => {
              if (res) {
                this.currentTheme = res;
                this.useDefaults = res.default;
                this.isSaving = false;
                this.updateForm(res);
              } else {
              }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }

  updateForm(theme: ITheme) {
    this.useDefaults = theme.default;
    if(theme.app) {
      this.appPropertyKeyMappings = theme.app;
    }
    if(theme.page) {
      this.pagePropertyKeyMappings = theme.page;
    }
    if(theme.pageController) {
      this.pageControlPropertyKeyMappings = theme.pageController;
    }
      this.editForm.patchValue({
        id: theme.uuid,
        default: theme.default,
        themestyle: theme.themestyle,
        inputStyle: theme.inputStyle,
        buttonTheme: theme.buttonTheme,
        portalDisplayName: theme.portalDisplayName,
        mainLogoUrl: theme.mainLogoUrl,
        toolbarposition: theme.toolbarposition,
        footerposition: theme.footerposition,
        canvasbackgroundcolor: theme.canvasbackgroundcolor,
        generalfontsize: theme.generalfontsize,
        generalfontcolor: theme.generalfontcolor,
        generalfontweight: theme.generalfontweight,
        generalpagewidth: theme.generalpagewidth,
        sidebarfontsize: theme.sidebarfontsize,
        sidebarfontweight: theme.sidebarfontweight,
        sidebarfontcolor: theme.sidebarfontcolor,
        themeselected: theme.themeselected,
        footervisibility: theme.footervisibility,
        primaryColor: theme.primaryColor,
        primaryLightColor: theme.primaryLightColor,
        primaryMediumColor: theme.primaryMediumColor,
        secondaryColor: theme.secondaryColor,
        secondaryMediumColor: theme.secondaryMediumColor,
      });
    this.enableDisableForm(false);
  }
  previousState() {
    this.isVisibleEvent.emit(false);
  }

  save() {
    this.spinnerService.show();
    this.isSaving = true;
    const theme = this.createFromForm();
    if (theme.uuid) {
      theme.name = this.currentTheme.name;
      this.subscribeToSaveResponse(this.themeService.update(theme, this.projectUid));
    } else {
      this.subscribeToSaveResponse(this.themeService.create(theme, this.projectUid));
    }
  }

  private createFromForm(): ITheme {
    return {
      ...new Theme(),
      uuid: this.editForm.get(['id']).value,
      themestyle: this.editForm.get(['themestyle']).value,
      inputStyle: this.editForm.get(['inputStyle']).value,
      buttonTheme: this.editForm.get(['buttonTheme']).value,
      portalDisplayName: this.editForm.get(['portalDisplayName']).value,
      mainLogoUrl: this.editForm.get(['mainLogoUrl']).value,
      default: this.useDefaults,
      layoutorientationRTL: false,
      toolbarposition: this.editForm.get(['toolbarposition']).value,
      footerposition: this.editForm.get(['footerposition']).value,
      footervisibility: this.editForm.get(['footervisibility']).value,
      themeselected: this.editForm.get(['themeselected']).value,
      primaryColor: this.editForm.get(['primaryColor']).value,
      primaryLightColor: this.editForm.get(['primaryLightColor']).value,
      primaryMediumColor: this.editForm.get(['primaryMediumColor']).value,
      secondaryColor: this.editForm.get(['secondaryColor']).value,
      secondaryMediumColor: this.editForm.get(['secondaryMediumColor']).value,
      canvasbackgroundcolor: this.editForm.get(['canvasbackgroundcolor']).value,
      generalfontsize: this.calculateFontSize(this.editForm.get(['generalfontsize']).value),
      generalfontcolor: this.editForm.get(['generalfontcolor']).value,
      generalfontweight: this.calculateFontWeight(this.editForm.get(['generalfontweight']).value),
      generalpagewidth: this.editForm.get(['generalpagewidth']).value,
      sidebarfontsize: this.calculateFontSize(this.editForm.get(['sidebarfontsize']).value),
      sidebarfontweight: this.calculateFontWeight(this.editForm.get(['sidebarfontweight']).value),
      sidebarfontcolor: this.editForm.get(['sidebarfontcolor']).value,
      projectUuid: this.projectUid,
      app: this.appPropertyKeyMappings,
      page: this.pagePropertyKeyMappings,
      pageController: this.pageControlPropertyKeyMappings,
    };
  }

  calculateFontSize(val) {
    switch (val) {
      case 'small' : return 17;
      case 'medium' : return 20;
      case 'large' : return 25;
      default: return 20;
    }
  }

  calculateFontWeight(val) {
    switch (val) {
      case 'bold' : return 600;
      case '500' : return 500;
      case '400' : return 400;
      case '300' : return 300;
      case '200' : return 200;
      case '100' : return 100;
      default: return 100;
    }
  }
  changeDefaults(event) {
    this.useDefaults = event;
    this.enableDisableForm(true);
  }

  enableDisableForm(reset) {
    if (this.useDefaults) {
      if (reset) {
        this.resetToDefaults();
      }
      this.editForm.disable();
    } else {
      this.editForm.enable();
    }
  }

  resetToDefaults() {
    this.editForm.patchValue({
      themestyle: this.defaultValues.themestyle,
      inputStyle: this.defaultValues.inputStyle,
      buttonTheme: this.defaultValues.buttonTheme,
      toolbarposition: this.defaultValues.toolbarposition,
      footerposition: this.defaultValues.footerposition,
      themeselected: this.defaultValues.themeselected,
      footervisibility: this.defaultValues.footervisibility,
      primaryColor: this.defaultValues.primaryColor,
      primaryLightColor: this.defaultValues.primaryLightColor,
      primaryMediumColor: this.defaultValues.primaryMediumColor,
      secondaryColor: this.defaultValues.secondaryColor,
      secondaryMediumColor: this.defaultValues.secondaryMediumColor,
    });
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITheme>>) {
    result.subscribe(
      (res: any) => {
        const savedTheme: ITheme = res.body;
        this.uploadLogo(savedTheme.uuid);
        this.onSaveSuccess();
      },
      () => this.onSaveError()
    );
  }

  onAppRowSelect(event) {
    const formValues = event.data;
    this.editForm.patchValue({
      propkey: formValues.key,
      propname: formValues.name,
      propvalue: formValues.value,
      propdesc: formValues.desc,
    });
    this.headerText = 'Update an Environment Variable';
    this.selectedAppIndex = this.appPropertyKeyMappings.indexOf(event.data);
    this.displayAppDialog = true;
    this.newAppMapping = false;
  }

  apptable() {
    this.displayAppDialog = true;
  }

  deleteAppRow(param) {
    const index = this.appPropertyKeyMappings.indexOf(param);
    this.appPropertyKeyMappings.splice(index, 1);
  }
  showDialogToAddApp() {
    this.editForm.patchValue({
      propkey: '',
      propname: '',
      propvalue: '',
      propdesc: '',
    });
    this.headerText = 'Add property values';
    this.selectedAppIndex = -1;
    this.newAppMapping = true;
    this.displayAppDialog = true;
  }
  addAppKey() {
    const key = this.editForm.get(['propkey']).value;
    const name = this.editForm.get(['propname']).value;
    const value = this.editForm.get(['propvalue']).value;
    const desc = this.editForm.get(['propdesc']).value;

    if (!key || !name || !desc) {
    } else {
      const param: IPropertyKeyValue = {
        key,
        name,
        value,
        description: desc,
      };
      if (this.newAppMapping) {
        this.appPropertyKeyMappings.push(param);
      } else if (this.selectedAppIndex != -1) {
        this.appPropertyKeyMappings[this.selectedAppIndex] = param;
      }
      this.displayAppDialog = false;
    }
  }

  //////


  onPageRowSelect(event) {
    const formValues = event.data;
    this.editForm.patchValue({
      pagepropkey: formValues.key,
      pagepropname: formValues.name,
      pagepropvalue: formValues.value,
      pagepropdesc: formValues.desc,
    });
    this.headerText = 'Update an Environment Variable';
    this.selectedAppIndex = this.appPropertyKeyMappings.indexOf(event.data);
    this.displayPageDialog = true;
    this.newAppMapping = false;
  }

  appPagetable() {
    this.displayPageDialog = true;
  }

  deletePageRow(param) {
    const index = this.pagePropertyKeyMappings.indexOf(param);
    this.pagePropertyKeyMappings.splice(index, 1);
  }
  showDialogToAddPage() {
    this.editForm.patchValue({
      pagepropkey: '',
      pagepropname: '',
      pagepropvalue: '',
      pagepropdesc: '',
    });
    this.headerText = 'Add property values';
    this.selectedAppIndex = -1;
    this.newAppMapping = true;
    this.displayPageDialog = true;
  }
  addPageKey() {
    const key = this.editForm.get(['pagepropkey']).value;
    const name = this.editForm.get(['pagepropname']).value;
    const value = this.editForm.get(['pagepropvalue']).value;
    const desc = this.editForm.get(['pagepropdesc']).value;

    if (!key || !name || !desc) {
    } else {
      const param: IPropertyKeyValue = {
        key,
        name,
        value,
        description: desc,
      };
      if (this.newAppMapping) {
        this.pagePropertyKeyMappings.push(param);
      } else if (this.selectedAppIndex != -1) {
        this.pagePropertyKeyMappings[this.selectedAppIndex] = param;
      }
      this.displayPageDialog = false;
    }
  }


  ////////


  onPageControlRowSelect(event) {
    const formValues = event.data;
    this.editForm.patchValue({
      pagecontrolpropkey: formValues.key,
      pagecontrolpropname: formValues.name,
      pagecontrolpropvalue: formValues.value,
      pagecontrolpropdesc: formValues.desc,
    });
    this.headerText = 'Update an Environment Variable';
    this.selectedAppIndex = this.appPropertyKeyMappings.indexOf(event.data);
    this.displayPageControlDialog = true;
    this.newAppMapping = false;
  }

  pageControltable() {
    this.displayPageControlDialog = true;
  }

  deletePageControlRow(param) {
    const index = this.pageControlPropertyKeyMappings.indexOf(param);
    this.pageControlPropertyKeyMappings.splice(index, 1);
  }
  showDialogToAddPageControl() {
    this.editForm.patchValue({
      pagecontrolpropkey: '',
      pagecontrolpropname: '',
      pagecontrolpropvalue: '',
      pagecontrolpropdesc: '',
    });
    this.headerText = 'Add property values';
    this.selectedAppIndex = -1;
    this.newAppMapping = true;
    this.displayPageControlDialog = true;
  }
  addPageControlKey() {
    const key = this.editForm.get(['pagecontrolpropkey']).value;
    const name = this.editForm.get(['pagecontrolpropname']).value;
    const value = this.editForm.get(['pagecontrolpropvalue']).value;
    const desc = this.editForm.get(['pagecontrolpropdesc']).value;

    if (!key || !name || !desc) {
    } else {
      const param: IPropertyKeyValue = {
        key,
        name,
        value,
        description: desc,
      };
      if (this.newAppMapping) {
        this.pageControlPropertyKeyMappings.push(param);
      } else if (this.selectedAppIndex != -1) {
        this.pageControlPropertyKeyMappings[this.selectedAppIndex] = param;
      }
      this.displayPageControlDialog = false;
    }
  }

  uploadLogo(themeId) {
    const formData = new FormData();
    if (this.fileInput.files.length > 0) {
      this.fileInput.files.forEach(file => {
        formData.append('file', file);
      });
      this.subscribeToSaveImageResponse(this.themeService.imageUpload(formData, themeId, this.projectUid));
    }
  }

  protected subscribeToSaveImageResponse(result: Observable<HttpResponse<any>>) {
    result.subscribe(
      () => this.onSaveImageSuccess(),
      () => this.onSaveImageError()
    );
  }

  protected onSaveImageSuccess() {}

  protected onSaveImageError() {}

  protected onSaveSuccess() {
    this.spinnerService.hide();
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError() {
    this.spinnerService.hide();
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }

  ngOnDestroy() {
    // this.toolbarTrackerService.setProjectUUID('');
    // this.toolbarTrackerService.setIsEntityPage('no');
  }
}
