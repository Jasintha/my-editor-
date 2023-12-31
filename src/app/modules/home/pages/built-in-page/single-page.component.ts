import {Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges, ViewEncapsulation} from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IProject } from '@app/shared/models/model/project.model';
import {IDatamodel} from '@shared/models/model/datamodel.model';
import {MessageService, SelectItem} from 'primeng/api';
import {IPage, Page} from '@shared/models/model/page.model';
import { IAggregate } from '@app/shared/models/model/aggregate.model';
import {APIInput} from '@shared/models/model/api-input.model';
import {Config, IConfig, IPageConfig} from '@shared/models/model/page-config.model';
import {BuiltInPageService} from '@core/projectservices/built-in-page.service';
import {ProjectService} from '@core/projectservices/project.service';
import {EventManagerService} from '@shared/events/event.type';
import {PageConfigService} from '@core/projectservices/page-config.service';
import {MicroserviceInstallerService} from '@core/projectservices/microservice-installer.service';
import {IInstalledMicroservice} from '@shared/models/model/installed-microservice.model';
import {IProperty} from '@shared/models/model/property.model';
import {IPageApi} from '@home/pages/aggregate/microservice-add-model-constraints-dialog.component';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {IHybridfunction} from '@shared/models/model/hybridfunction.model';
import {IApi} from '@shared/models/model/microservice-api.model';
import {InitPageCreationComponent} from '@home/pages/built-in-page/init-page-creation.component';
import {MatDialog} from '@angular/material/dialog';
import {CreateModelComponent} from '@home/pages/create-model/create-model.component';
import {MatTableDataSource} from '@angular/material/table';
import {AddFormControllersComponent} from '@home/pages/built-in-page/add-form-controllers.component';
import {ViewModelConfigComponent} from '@home/pages/built-in-page/view-model-config.component';
import {MainMenuComponent} from '@home/pages/main-menu/main-menu.component';
import {PageNavigationComponent} from '@home/pages/page-navigation/page-navigation.component';
import {ConsoleLogService} from '@core/projectservices/console-logs.service';
import {Actions, Buttons, ButtonType, IActions, IButtonEvent, IButtonType} from '@shared/models/model/button-type.model';
import {IFormField, IRowFieldMapping, IRowHeader, ISourceTargetFieldsRequest, RowFieldMapping} from '@shared/models/model/form-field.model';
import {BuiltInPageDeleteDialogComponent} from '@home/pages/built-in-page/built-in-page-delete-dialog.component';
import {ModelChangeConfirmDialogComponent} from '@home/pages/built-in-page/model-change-confirm-dialog.component';
import {ChartDetails} from '@shared/models/model/chart-details.model';
import {INavigationParam} from '@shared/models/model/page-navigation.model';
import {PageSaveConfirmDialogComponent} from '@home/pages/built-in-page/page-save-confirm-dialog.component';
import {PageActionEventComponent} from '@home/pages/built-in-page/page-action-event.component';
import {ButtonEventHandleComponent} from '@home/pages/built-in-page/button-event-handle.component';
import {StepFieldMapperComponent} from '@home/pages/built-in-page/step-field-mapper.component';
import {RequirementService} from '@core/projectservices/requirement.service';

@Component({
  selector: 'virtuan-single-page-view',
  templateUrl: './single-page.component.html',
  styleUrls: ['./built-in-page.component.scss'],
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None
})
export class SinglePageViewComponent implements OnInit, OnDestroy , OnChanges{
  @Input() projectUid: string;
  @Input() pageId: string;
  isSaving: boolean;
  projectId: number;
  project: IProject;
  datamodels: IDatamodel[];
  pageTemplateItems: SelectItem[];
  datamodelItems: SelectItem[];
  currentPage: IPage;
  currentModel: any;
  microservices: IInstalledMicroservice[];
  microserviceProjects: IProject[];
  dashboardProjects: IProject[];
  microserviceItems: SelectItem[];
  microserviceProjectItems: SelectItem[];
  dashboardProjectItems: SelectItem[];
  modelPropertyList: SelectItem[];
  modelAttributesList: IProperty[];
  apiItems: SelectItem[];
  panelItems: SelectItem[];
  aggregates: IAggregate[];
  aggregateItems: SelectItem[];
  apiParams: APIInput[];
  apiResourceDetails: any[];
  removedAIOResourceData = false;
  dashboardPanelDetails: any[];
  // projectUid: string;
  loginParams: any[];
  isLoginPageExist: string;
  isRegisterPageExist: string;
  pageTitle: string;
  pageDescription: string;
  backgroundImage: string;
  pageConfigs: IConfig[];
  clonedCars: { [s: string]: Config } = {};
  // pageId: string;
  isHomePageExist = 'false';
  isSidebarVisible = false;
  rowValues = '';
  isSelected = false;
  createStatus: string;
  sidebar = false;
  aggregateId: string;
  configs: IPageConfig;
  pagestyle: string;
  stepFieldArr: any[] = [];
  headerFieldArr: any[] = [];
  removedAllSections = false;
  stepHeadersList: any[] = [];
  removedAllSteppers = false;
  detailsHeadersList: SelectItem[] = [];
  stepIndexId = 1;
  headerIndexId = 1;
  displayedColumns: string[] = ['caption', 'resourcepath', 'operation','method', 'page', 'color', 'tooltip', 'events', 'actions'];
  eventDisplayedColumns: string[] = ['button', 'event', 'action', 'page', 'api', 'actions'];
  actions: IActions;
  BTN_ELEMENT_DATA: IButtonType[];
  dataSource = new MatTableDataSource(this.BTN_ELEMENT_DATA);
  removedAllActionButtons = false;
  displayedStepHeaderColumns: string[] = ['field', 'stepheader', 'actions'];
  ELEMENT_DATA = [];
  dataSourceWizard = new MatTableDataSource(this.ELEMENT_DATA);
  sourceTargetFieldsRequest: ISourceTargetFieldsRequest;
  rowHeaderMappingArray: IRowFieldMapping[] = [];
  fieldDataSourceWizard = new MatTableDataSource(this.rowHeaderMappingArray);
  sourceProperties: IFormField[];
  targetProperties: IFormField[];
  rowIdList = [];
  rowHeaderList: IRowHeader[] = [];
  fieldMapDisplayedColumns: string[] = ['field','rowId'];
  allpages = [];
  pages = [];
  navigationParams: INavigationParam[] = [];
  displayedDetailHeaderColumns: string[] = ['field', 'detailsHeader', 'actions'];
  dataSourceDetailsPage = new MatTableDataSource(this.headerFieldArr);
  fieldOrderView = false;
  actionButtonView = false;
  displayedLoginParamColumns: string[] = ['input', 'param', 'actions'];
  LOGIN_DATA = [];
  dataSourceLogin = new MatTableDataSource(this.LOGIN_DATA);
  removedAllLoginData = false
  btnEventActionList: IButtonType[];
  eventDataSource = new MatTableDataSource(this.btnEventActionList);
  displayedtileParamColumns: string[] = ['tileField', 'attribute', 'actions'];
  TILE_DATA = [];
  dataSourceTile = new MatTableDataSource(this.TILE_DATA);
  displayedAioParamColumns: string[] = ['operation', 'path', 'actions'];
  PARAM_DATA = [];
  dataSourceAIOParam = new MatTableDataSource(this.PARAM_DATA);
  landingPageMapping = [];
  dataSourceLandingPageMapping = new MatTableDataSource(this.landingPageMapping);
  displayedLandingPageColumns: string[] = ['page', 'roles', 'remove'];
  removedAllLangingPageMappingData = false
  panelTypeItems: SelectItem[] = [
    { label: 'Graph', value: 'graph' },
    { label: 'Gauge', value: 'gauge' },
    { label: 'Logs', value: 'logs' },
    { label: 'Stat', value: 'stat' },
    { label: 'Bar Gauge', value: 'bargauge' },
    { label: 'Table', value: 'table' },
  ];

  pageAlignmentList: SelectItem[] = [
    { label: 'bottomCenter', value: 'bottomCenter' },
    { label: 'bottomLeft', value: 'bottomLeft' },
    { label: 'bottomRight', value: 'bottomRight' },
    { label: 'center', value: 'center' },
    { label: 'centerLeft', value: 'centerLeft' },
    { label: 'topCenter', value: 'topCenter' },
    { label: 'topLeft', value: 'topLeft' },
    { label: 'topRight', value: 'topRight' },
  ];

  tilePageFields: SelectItem[] = [
    { label: 'Title', value: 'Title'},
    { label: 'Subtitle', value: 'Subtitle'},
    { label: 'Description', value: 'Description'},
    { label: 'Field', value: 'Field'},
    { label: 'Image', value: 'Image'},
  ];

  titleAlignments: SelectItem[] = [
    { label: ':Left', value: 'Left'},
    { label: 'Right', value: 'Right'},
    { label: 'Center', value: 'Center'},
  ];

  fontSizes: SelectItem[] = [
    { label: 'Small', value: 'Small'},
    { label: 'Medium', value: 'Medium'},
    { label: 'Large', value: 'Large'},
  ];

  crudItems: SelectItem[] = [
    { label: 'CREATE', value: 'CREATE' },
    { label: 'UPDATE', value: 'UPDATE' },
    { label: 'DELETE', value: 'DELETE' },
    { label: 'FIND', value: 'FIND' },
    { label: 'SEARCH', value: 'SEARCH' },
  ];
  loginInputs: SelectItem[] = [
    { label: 'User Name', value: 'UNAME' },
    { label: 'Password', value: 'password' },
  ];
  confirmationTypes: SelectItem[] = [
    { label: 'Without-Confirm', value: 'Without-Confirm' },
    { label: 'Basic-Confirm', value: 'Basic-Confirm' },
    { label: 'Text-Confirm', value: 'Text-Confirm' },
  ];
  operationItems: SelectItem[] = [
    { label: 'CREATE', value: 'CREATE' },
    { label: 'FIND', value: 'FIND' },
    { label: 'DELETE', value: 'DELETE' },
    { label: 'UPDATE', value: 'UPDATE' },
    { label: 'NAVIGATE', value: 'NAVIGATE' },
    { label: 'SEARCH', value: 'SEARCH' },
  ];
  paramDataTypeItems: SelectItem[] = [
    { label: 'TEXT', value: 'TEXT' },
    { label: 'NUMBER', value: 'NUMBER' },
    { label: 'FLOAT', value: 'FLOAT' },
    { label: 'TRUE_OR_FALSE', value: 'TRUE_OR_FALSE' },
    { label: 'DATE', value: 'DATE' },
    { label: 'FILE', value: 'FILE' },
  ];
  tabLayouts: SelectItem[] = [
    { label: 'vertical', value: 'vertical' },
    { label: 'horizontal', value: 'horizontal' },
  ];
  chartTypes: SelectItem[] = [
    { label: 'BarChart', value: 'BarChart' },
    { label: 'PieChart', value: 'PieChart' },
    { label: 'DonutChart', value: 'DonutChart' },
  ];
  chartAxis: SelectItem[] = [
    { label: 'vertical', value: 'vertical' },
    { label: 'horizontal', value: 'horizontal' },
  ];
  pageEvents: SelectItem[] = [
    { label: 'ON-LOAD', value: 'ON-LOAD' },
    { label: 'ON-SUBMIT', value: 'ON-SUBMIT' },
    { label: 'AFTER-SUBMIT', value: 'AFTER-SUBMIT' },
  ];
  resourcePathMethods: SelectItem[] = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'DELETE', value: 'DELETE' },
  ];
  pageEventsActions: SelectItem[] = [
    { label: 'CALL_PAGE_ONLOAD', value: 'CALL_PAGE_ONLOAD' },
    { label: 'CALL_API', value: 'CALL_API' },
  ];
  editForm: FormGroup;
  isTitleEdit: boolean;
  isDescEdit: boolean;
  isBGUrlEdit: boolean;
  editPageAsJson: boolean;
  editorOptions: any = { language: 'json', readOnly: false, renderLineHighlight: 'none' };
  code: string = '';
  buildNewForm() {
    this.editForm = this.fb.group({
      id: [],
      selectedDatamodel: [],
      pagetitle: ['', [Validators.required]],
      pagetemplate: ['', [Validators.required]],
      apiOperation: [],
      apiResourcePath: [],
      isSecurePage: false,
      authority: '',
      isHomepage: false,
      resPathMethod: [],
      resourcePath: [],
      resPathMethod2: [],
      resourcePath2: [],
      selectedAggregate: [],
      paramType: [],
      paramName: [],
      paramDataType: [],
      microservice: [],
      microservice2: [],
      api: [],
      search: false,
      api2: [],
      search2: false,
      aiosearch: false,
      aiomicroservice: [],
      dashboard: [],
      dashboardsearch: false,
      dashboardPanel: [],
      panelType: '',
      panelName: '',
      dashboardUID: '',
      dashboardTitle: '',
      panelID: '',
      aioapi: [],
      inputValType: [],
      matchedProperty: [],
      matchedAttribute: [],
      tileFieldCount: [],
      fieldType: [],
      pageconfig: [],
      fieldName: [],
      stepHeader:[],
      detailHeader:[],
      attributeName:[],
      btnCaption: [],
      btnResourcePath: [],
      btnOperation: [],
      navigatePage: [],
      btnColor: [],
      btnTooltip: [],
      rowId: [],
      rowHeader: [],
      landingPage: [],
      rolesList: [],
      chartType: '',
      wizardLayout: '',
      barChartAxis: '',
      donutArcsize: 0,
      chartHeight: 0,
      showLegend: false,
      pageDescription: '',
      btnConfirmationType: '',
      pageEventActionPage: '',
      pageEventAction: '',
      pageEvent: '',
      pageActionButton: '',
      pageEventActionApi: '',
      backgroundUrl: '',
      keyFontSize: '',
      valueFontSize: '',
      titleFontSize: '',
      titleAlignment: '',
      titleColor: '',
      titleBackgroundColor: '',
      widgetAlignment: '',
      pageBackgroundColor: '',
      imageWidth: '',
      imageHeight: '',
      wizardDetailsGroup: this.fb.array([
        new FormGroup({
          stepHeading: this.fb.control('Step 1'),
          stepId: this.fb.control(this.stepIndexId),
        }),
      ]),
      detailsHeaderGroup: this.fb.array([
        new FormGroup({
          stepHeading: this.fb.control('Header 1'),
          stepId: this.fb.control(this.headerIndexId),
        }),
      ]),
    });
  }

  setCategoryModelValidators() {
    const apptype = this.project.apptypesID;

    this.editForm.get('pagetemplate').valueChanges.subscribe(pagetemplate => {
      if (apptype === 'task.ui') {
        this.editForm.get('selectedDatamodel').clearValidators();
        this.editForm.get('selectedDatamodel').updateValueAndValidity();

        if (pagetemplate === 'table-page' || pagetemplate === 'form-page' || pagetemplate === 'form-wizard-page') {
          this.editForm.get('resourcePath').setValidators([Validators.required]);
          this.editForm.get('resourcePath').updateValueAndValidity();

          this.editForm.get('selectedAggregate').setValidators([Validators.required]);
          this.editForm.get('selectedAggregate').updateValueAndValidity();
        } else if (pagetemplate === 'file-upload-page') {
          this.editForm.get('resourcePath').setValidators([Validators.required]);
          this.editForm.get('resourcePath').updateValueAndValidity();

          this.editForm.get('selectedAggregate').clearValidators();
          this.editForm.get('selectedAggregate').updateValueAndValidity();
        } else if (pagetemplate === 'aio-table' || pagetemplate === 'aio-grid') {
          this.editForm.get('resourcePath').clearValidators();
          this.editForm.get('resourcePath').updateValueAndValidity();

          this.editForm.get('selectedAggregate').setValidators([Validators.required]);
          this.editForm.get('selectedAggregate').updateValueAndValidity();
        } else {
          this.editForm.get('resourcePath').clearValidators();
          this.editForm.get('resourcePath').updateValueAndValidity();

          this.editForm.get('selectedAggregate').clearValidators();
          this.editForm.get('selectedAggregate').updateValueAndValidity();
        }
      } else {
        this.editForm.get('selectedDatamodel').setValidators([Validators.required]);
        this.editForm.get('selectedDatamodel').updateValueAndValidity();

        this.editForm.get('selectedAggregate').clearValidators();
        this.editForm.get('selectedAggregate').updateValueAndValidity();

        this.editForm.get('resourcePath').clearValidators();
        this.editForm.get('resourcePath').updateValueAndValidity();
      }
    });
  }

  setCategoryModelValidatorsTest() {
    this.activatedRoute.params.subscribe(params => {
      // this.projectId = params['projId'];
      if (this.projectUid) {
        this.projectService
            .find(this.projectUid)
            .pipe(
                filter((mayBeOk: HttpResponse<IProject>) => mayBeOk.ok),
                map((response: HttpResponse<IProject>) => response.body)
            )
            .subscribe((res: IProject) => {
              this.project = res;
              if (this.project.apptypesID === 'task.ui') {
                this.editForm.get('pagetemplate').valueChanges.subscribe(pagetemplate => {
                  if (
                      pagetemplate === 'table-page' ||
                      pagetemplate === 'form-page' ||
                      pagetemplate === 'form-wizard-page' ||
                      pagetemplate === 'file-upload-page'
                  ) {
                    this.editForm.get('resourcePath').setValidators([Validators.required]);
                    this.editForm.get('resourcePath').updateValueAndValidity();
                  }
                  if (pagetemplate === 'aio-table' || pagetemplate === 'aio-grid' || pagetemplate === 'dashboard-page') {
                    this.editForm.get('resourcePath').clearValidators();
                    this.editForm.get('resourcePath').updateValueAndValidity();
                  }
                  if (pagetemplate === 'file-upload-page' || pagetemplate === 'label-page') {
                    this.editForm.get('selectedAggregate').clearValidators();
                    this.editForm.get('selectedAggregate').updateValueAndValidity();
                  } else {
                    this.editForm.get('selectedAggregate').setValidators([Validators.required]);
                    this.editForm.get('selectedAggregate').updateValueAndValidity();
                  }
                });

                this.editForm.get('selectedDatamodel').clearValidators();
                this.editForm.get('selectedDatamodel').updateValueAndValidity();
              }
              if (this.project.apptypesID === 'virtuan.webapp-v2') {
                this.editForm.get('selectedDatamodel').setValidators([Validators.required]);
                this.editForm.get('selectedDatamodel').updateValueAndValidity();

                this.editForm.get('selectedAggregate').clearValidators();
                this.editForm.get('selectedAggregate').updateValueAndValidity();

                this.editForm.get('resourcePath').clearValidators();
                this.editForm.get('resourcePath').updateValueAndValidity();
              }
            });
      }
    });
  }

  constructor(
      protected builtInPageService: BuiltInPageService,
      protected activatedRoute: ActivatedRoute,
      private fb: FormBuilder,
      protected projectService: ProjectService,
      protected microserviceService: MicroserviceInstallerService,
      protected eventManager: EventManagerService,
      private router: Router,
      protected pageConfigService: PageConfigService,
      public dialog: MatDialog,
      private consoleLogService: ConsoleLogService,
      private messageService: MessageService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    this.loadPage(false)
  }

  ngOnInit() {
    this.editPageAsJson = false
  }

  loadPage(isreaload: boolean){
    // if(!isreaload) {
    //   this.isTitleEdit = true;
    // } else {
    //   this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Page saved' });
    // }
    this.buildNewForm();
    this.datamodels = [];
    this.pageTemplateItems = [];
    this.datamodelItems = [];
    this.isSaving = false;
    this.microserviceItems = [];
    this.modelPropertyList = [];
    this.loginParams = [];
    this.microserviceProjectItems = [];
    this.dashboardProjectItems = [];
    this.apiItems = [];
    this.panelItems = [];
    this.aggregateItems = [];
    this.apiParams = [];
    this.apiResourceDetails = [];
    this.dashboardPanelDetails = [];
    this.BTN_ELEMENT_DATA = [];
    this.dataSource = new MatTableDataSource(this.BTN_ELEMENT_DATA);
    this.btnEventActionList = [];
    this.eventDataSource = new MatTableDataSource(this.btnEventActionList);
    this.loadAllPages();
    this.actions = new Actions();
    this.actions.buttons = new Buttons()
    this.activatedRoute.params.subscribe(params => {
      // this.projectId = params['projId'];
      // this.projectUid = params.projectUid;
      if (this.projectUid) {
        this.projectService
            .findWithModels(this.projectUid)
            .pipe(
                filter((mayBeOk: HttpResponse<IProject>) => mayBeOk.ok),
                map((response: HttpResponse<IProject>) => response.body)
            )
            .subscribe(
                (res: IProject) => {
                  this.project = res;
                  this.getPageTemplates();
                  if (this.project.apptypesID === 'task.ui') {
                    this.aggregates = this.project.aggregates;
                    if (this.aggregates) {
                      this.loadAggregates();
                    }
                    this.loadMicroserviceProjects();
                    this.loadUpdateForm();
                  }
                  this.setCategoryModelValidators();
                  // this.loadUpdateForm();
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
      } else {
        this.loadUpdateForm();
      }
    });
    this.activatedRoute.params.subscribe(params => {
      // this.projectId = params['projId'];
      // this.pageId = params.pageId;
    });
    this.loadPageConfigsByPageId(this.pageId, this.projectUid);
  }

  addRow(setDefaults, defButtonCaption?, defBtnResourcePath?, defBtnOperation?, defBtnColor?, defBtnTooltip?) {

    let btnCaption = '';
    let btnResourcePath = '';
    let btnOperation = '';
    let btnColor = '';
    let btnTooltip = '';
    let navigatePage = new Page();
    let   pageId = '';
    let  pageName = '';
    if(setDefaults) {
      btnCaption = defButtonCaption;
      btnResourcePath = defBtnResourcePath;
      btnOperation = defBtnOperation;
      btnColor = defBtnColor;
      btnTooltip = defBtnTooltip;
    }
    else{
      btnCaption = this.editForm.get(['btnCaption']).value;
      btnResourcePath = this.getBtnResourcePath(this.editForm.get(['btnResourcePath']).value);
      btnOperation = this.editForm.get(['btnOperation']).value;
      btnColor = this.editForm.get(['btnColor']).value;
      btnTooltip = this.editForm.get(['btnTooltip']).value;
      navigatePage = this.editForm.get(['navigatePage']).value;
      if(navigatePage) {
        pageId = navigatePage.uuid;
        pageName = navigatePage.pagetitle;
      }
    }


    if (btnCaption !== null || btnResourcePath !== '' || btnOperation !== null) {
      const button: IButtonType = {
        caption: btnCaption ,
        resourcePath: btnResourcePath,
        operation: btnOperation,
        color: btnColor,
        tooltip: btnTooltip,
        pageId,
        pageName
      };
      this.BTN_ELEMENT_DATA.push(button);
      this.dataSource = new MatTableDataSource(this.BTN_ELEMENT_DATA);
    //  this.checkPageNameExist();
    } else {
      // error message
    }
  }

  onPageEditModeChanged() {
    if(this.editPageAsJson) {
      this.savePageAsJson();
    } else {
      this.checkAndUpdatePageName();
    }
  }

  addPageEvent() {
    let button = new ButtonType();
    let btnEvent = '';
    let btnEventAction = '';
    let btnEventActionPage = new Page();
    let btnEventActionAPI = '';
    let   pageId = '';
    let  pageName = '';
    button = this.editForm.get(['pageActionButton']).value;
    btnEvent = this.editForm.get(['pageEvent']).value;
    btnEventAction = this.editForm.get(['pageEventAction']).value;

    btnEventActionAPI = this.editForm.get(['pageEventActionApi']).value;
    btnEventActionPage = this.editForm.get(['pageEventActionPage']).value;
    if(btnEventActionPage) {
      pageId = btnEventActionPage.uuid;
      pageName = btnEventActionPage.pagetitle;
    }
    if (button !== null && btnEvent !== '' && btnEventAction !== null) {
      const buttonEvent: IButtonEvent = {
        btnId: button.uuid ,
        btnCaption: button.caption ,
        resourcePath: btnEventActionAPI,
        event: btnEvent,
        eventAction: btnEventAction,
        pageName,
        pageId,
      };
      this.btnEventActionList.push(buttonEvent);
      this.eventDataSource = new MatTableDataSource(this.btnEventActionList);
    } else {
      // error message
    }
  }

  getBtnResourcePath(resourcePath) {
    if (resourcePath) {
      if (!resourcePath.startsWith('/')) {
        resourcePath = '/' + resourcePath;
      }
    } else {
      resourcePath = '/';
    }
    return resourcePath;
  }

  addDefaultBtns() {
    if(this.currentPage.pagetemplate === 'form-page') {
      const btnCaption = 'Add';
      const btnResourcePath = this.editForm.get(['resourcePath']).value;
      const btnOperation = 'CREATE';
      const btnColor = '#0f6ab4';
      const btnTooltip = 'Add';
      this.addRow(true, btnCaption, btnResourcePath, btnOperation, btnColor, btnTooltip);
    }
  }

  deleteRow(param) {
    const index = this.BTN_ELEMENT_DATA.indexOf(param);
    this.BTN_ELEMENT_DATA.splice(index, 1);
    this.dataSource = new MatTableDataSource(this.BTN_ELEMENT_DATA);
    if(this.BTN_ELEMENT_DATA.length === 0) {
      this.removedAllActionButtons = true;
    }
  }

  editEvents(button, index) {
    const page = this.currentPage;
    if(!this.BTN_ELEMENT_DATA[index].buttonEvents) {
      this.BTN_ELEMENT_DATA[index].buttonEvents = [];
    }
    const dialogRef = this.dialog.open(ButtonEventHandleComponent, {
      panelClass: ['virtuan-dialog'],
      data: {
        button,
        btnEventActionList: this.BTN_ELEMENT_DATA[index].buttonEvents,
        pages: this.pages,
        fieldController: 'Button',
      }
    });
    dialogRef.afterClosed(
    ).subscribe(result => {
      if (result) {
        this.BTN_ELEMENT_DATA[index].buttonEvents = result;
        this.dataSource = new MatTableDataSource(this.BTN_ELEMENT_DATA);
        this.savePageActions();
      }
    });
  }

  deleteEventRow(param) {
    const index = this.btnEventActionList.indexOf(param);
    this.btnEventActionList.splice(index, 1);
    this.eventDataSource = new MatTableDataSource(this.btnEventActionList);
  }


  selectlandingPagesForRoles() {
    const page = this.editForm.get(['landingPage']).value;
    const roleString = this.editForm.get(['rolesList']).value;

    if (page === null || roleString === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warn',
        detail: 'Please fill all the fields',
      });
    } else {
      const param = {
        pageId: page.uuid,
        pageName: page.pagetitle,
        roleList: roleString.split(','),
      };
      if (this.landingPageMapping.indexOf(param) === -1) {
        this.landingPageMapping.push(param);
        this.dataSourceLandingPageMapping = new MatTableDataSource(this.landingPageMapping);
      }
    }
  }

  deleteLandinPageMapping(param) {
    const indexnum = this.landingPageMapping.indexOf(param);
    this.landingPageMapping.splice(indexnum, 1);
    this.dataSourceLandingPageMapping = new MatTableDataSource(this.landingPageMapping);
    if(this.landingPageMapping.length === 0) {
      this.removedAllLangingPageMappingData = true;
    }
  }

  saveLandingPageMappings() {
    const page = this.currentPage;
    page.landingPageRoleMappings = this.landingPageMapping;
    this.updateLandingPageRoleMappings(page);
  }

  saveGridPageMappings() {
    const page = this.currentPage;
    page.tileFields = this.TILE_DATA;
    this.updatePageTileMappings(page);
  }

  updateLandingPageRoleMappings(builtInPage: IPage) {
    this.isSaving = true;
    if (builtInPage.uuid) {
      this.subscribeToSaveResponse(this.builtInPageService.updatePageLoginInputs(builtInPage, this.projectUid));
    }
  }

  updatePageTileMappings(builtInPage: IPage) {
    this.isSaving = true;
    if (builtInPage.uuid) {
      this.subscribeToSaveResponse(this.builtInPageService.updatePageTileMappings(builtInPage, this.projectUid));
    }
  }

  addParamMapping() {
    const inputType = this.editForm.get(['inputValType']).value;
    const paramName = this.editForm.get(['matchedProperty']).value;

    if (inputType === null || paramName === '' || paramName === null) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warn',
        detail: 'Please fill all the fields',
      });
    } else {
      const param = {
        inputType,
        paramName,
      };
      if (this.loginParams.indexOf(param) === -1) {
        this.loginParams.push(param);
        this.dataSourceLogin = new MatTableDataSource(this.loginParams);
      }
    }
  }

  addTileFieldMapping() {
    const tileField = this.editForm.get(['fieldType']).value;
    const attribute = this.editForm.get(['matchedAttribute']).value;

    const titleFontSizeVal = this.editForm.get(['titleFontSize']).value;
    const titleAlignment = this.editForm.get(['titleAlignment']).value;
    const titleColor = this.editForm.get(['titleColor']).value;
    const titleBackgroundColor = this.editForm.get(['titleBackgroundColor']).value;
    const keyFontSizeVal = this.editForm.get(['keyFontSize']).value;
    const valueFontSizeVal = this.editForm.get(['valueFontSize']).value;
    let imageHeight = this.editForm.get(['imageHeight']).value;
    let imageWidth = this.editForm.get(['imageWidth']).value;
    if( !(imageHeight > 0)) {
      imageHeight = 140;
    }
    if (!(imageWidth > 0)) {
      imageWidth = 170;
    }
    if (tileField === null || attribute === '' || attribute === null) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warn',
        detail: 'Please fill all the fields',
      });
    } else {
      const param = {
        tileField,
        attribute,
        titleFontSize : this.calculateFonts(titleFontSizeVal),
        titleAlignment,
        titleColor,
        titleBackgroundColor,
        keyFontSize : this.calculateFonts(keyFontSizeVal),
        valueFontSize: this.calculateFonts(valueFontSizeVal),
        imageHeight,
        imageWidth
      };
      if (this.TILE_DATA.indexOf(param) === -1) {
        this.TILE_DATA.push(param);
        this.dataSourceTile = new MatTableDataSource(this.TILE_DATA);
      }
    }
  }

  calculateFonts(val) {
    switch (val) {
      case 'small' : return 17;
      case 'medium' : return 20;
      case 'large' : return 25;
      default: return 20;
    }
  }

  deleteTilePageMapping(param) {
    const indexnum = this.TILE_DATA.indexOf(param);
    if(indexnum !== -1) {
      this.TILE_DATA.splice(indexnum, 1);
      this.dataSourceTile = new MatTableDataSource(this.TILE_DATA);
    }
  }

  addActionButton(){
      const dialogRef = this.dialog.open(PageActionEventComponent, {
        panelClass: ['virtuan-dialog'],
        data: {
          currentPage: this.currentPage,
          pages: this.pages
        }
      });
      dialogRef.afterClosed(
      ).subscribe(result => {
        if (result) {
          this.BTN_ELEMENT_DATA.push(result);
          this.dataSource = new MatTableDataSource(this.BTN_ELEMENT_DATA);
        }
      });
  }

  savePageActions(){
    const page = this.currentPage;
    this.actions.buttons.child = this.BTN_ELEMENT_DATA;
    page.actions = this.actions;
    this.updatePageActions(page);
  }

  deleteParamMapping(param) {
    const indexnum = this.loginParams.indexOf(param);
    this.loginParams.splice(indexnum, 1);
    this.dataSourceLogin = new MatTableDataSource(this.loginParams);
    if(this.loginParams.length === 0) {
      this.removedAllLoginData = true;
    }
    const index = this.loginParams.indexOf(param);
    this.loginParams.splice(index, 1);
  }

  addAIOTableRow() {
    const apiOperation = this.editForm.get(['apiOperation']).value;
    const apiResourcePath = this.editForm.get(['apiResourcePath']).value;

    if (apiOperation === null || apiResourcePath === null || apiResourcePath === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warn',
        detail: 'Please fill all the fields',
      });
    } else {
      const resource = {
        apiOperation,
        apiResourcePath,
      };

      this.apiResourceDetails.push(resource);
      this.dataSourceAIOParam = new MatTableDataSource(this.apiResourceDetails);
    }
  }

  // onChangePageModel(event, edit) {
  //   if (event) {
  //     this.modelPropertyList = [];
  //     let currentDatamodel: IAggregate;
  //     currentDatamodel = edit ? event : event.value;
  //     this.loadModelPropertyList(event,edit);
  //     this.changePageModel(currentDatamodel);
  //   }
  // }

  // validatePageSave() {
  //   const page = this.currentPage;
  //   if(page.model && page.resourcePath && page.actions && page.actions.buttons && page.actions.buttons.child
  //       && page.actions.buttons.child.length > 0) {
  //     const dialogRef = this.dialog.open(PageSaveConfirmDialogComponent, {
  //       panelClass: ['virtuan-dialog'],
  //     });
  //     dialogRef.afterClosed(
  //     ).subscribe(result => {
  //       if (result) {
  //         this.checkPageNameExist();
  //       }
  //     });
  //   } else {
  //     this.checkPageNameExist();
  //   }
  // }

  loadModelPropertyList(){
    let currentDatamodeProperties: IProperty[];
    this.currentModel  = this.currentPage.model;
    currentDatamodeProperties = this.currentModel.config.children;
    this.modelAttributesList = currentDatamodeProperties;
    for (let i = 0; i < currentDatamodeProperties.length; i++) {
      if (currentDatamodeProperties[i].data.type === 'property') {
        const dropdownLabel = currentDatamodeProperties[i].label;
        this.modelPropertyList.push({ label: dropdownLabel, value: dropdownLabel, title: currentDatamodeProperties[i].name });
      }
    }
  }

  openPageControllerConfig()  {
    const dialogRef = this.dialog.open(AddFormControllersComponent, {
      panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
      data: {
        projectUid: this.projectUid,
        pageId: this.pageId,
      }
    });
    dialogRef.afterClosed(
    ).subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  onRowIdChange(rowId, field, index) {
    if(this.rowHeaderMappingArray[index].field === field) {
      this.rowHeaderMappingArray[index].rowId = rowId;
    }
  }

  changePageModel(selectedModel : IAggregate) {
    this.currentModel  = this.currentPage.model;
    if(this.currentModel) {
      const dialogRef = this.dialog.open(ModelChangeConfirmDialogComponent, {
        panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
      });
      dialogRef.afterClosed(
      ).subscribe(result => {
        if (result) {
          const page = this.getChangedPageModel(selectedModel);
          this.notifyModelChange(selectedModel);
          this.save(page);
        }
      });
    }
  }

  saveRowHeader() {
    const rowId = this.editForm.get(['rowId']).value;
    const rowHeader = this.editForm.get(['rowHeader']).value;
    if(rowHeader!== undefined && rowId < this.rowHeaderList.length -1)
      this.rowHeaderList[rowId].rowHeader =  this.editForm.get(['rowHeader']).value;
  }


  changeRowHeader() {
    const rowId = this.editForm.get(['rowId']).value;
    if(rowId && rowId < this.rowHeaderList.length -1) {
      const rowHeader =  this.rowHeaderList[rowId].rowHeader;
      this.editForm.get(['rowHeader']).patchValue(rowHeader);
    }
  }

  //
  // openRowFieldMappingConfig()  {
  //   const dialogRef = this.dialog.open(CreateFieldRowMappingComponent, {
  //     panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
  //     data: {
  //       projectUid: this.projectUid,
  //       pageId: this.pageId,
  //     }
  //   });
  //   dialogRef.afterClosed(
  //   ).subscribe(result => {
  //     console.log(`Dialog result: ${result}`);
  //   });
  // }

  loadAllSourceTargetFormFieldsForPage(page : IPage) {
    if (page.rowMappings && page.rowMappings.length > 0) {
      this.CreateFormFieldTable(page, true);
    } else {
      // this.spinnerService.show();
      this.builtInPageService
          .findAllSourceTargetFormFieldsForPage(this.pageId, this.projectUid)
          .pipe(
              filter((res: HttpResponse<ISourceTargetFieldsRequest>) => res.ok),
              map((res: HttpResponse<ISourceTargetFieldsRequest>) => res.body)
          )
          .subscribe(
              (res: ISourceTargetFieldsRequest) => {
                this.CreateFormFieldTable(res, false);
              },
              (res: HttpErrorResponse) => this.onError(res.message)
          );
    }
  }

  CreateFormFieldTable(rowMappingSource: any, isUpdate: boolean) {
    this.rowHeaderMappingArray = [];
    this.rowIdList = [];
    this.rowHeaderList = [];
    this.sourceTargetFieldsRequest = rowMappingSource;
    this.sourceProperties = this.sourceTargetFieldsRequest.sourceFormFields;
    this.targetProperties = this.sourceTargetFieldsRequest.targetFormFields;
    if (this.targetProperties && !isUpdate) {
      for (let i = 0; i < this.targetProperties.length; i++) {
        const hasChild = this.targetProperties[i] && this.targetProperties[i].children;
        if (!hasChild) {
          const fieldMapping =  new RowFieldMapping();
          fieldMapping.field = this.targetProperties[i].propertyName;
          fieldMapping.rowId = i;
          this.rowHeaderMappingArray.push(fieldMapping);
          this.rowIdList.push(fieldMapping.rowId);
          this.rowHeaderList.push({
            rowId: fieldMapping.rowId,
            rowHeader: '',
          });
          this.fieldDataSourceWizard = new MatTableDataSource(this.rowHeaderMappingArray);
        }
      }
    } else if (rowMappingSource.rowMappings && isUpdate) {
      for (let i = 0; i < rowMappingSource.rowMappings.length; i++) {
        const fieldMapping =  new RowFieldMapping();
        fieldMapping.field = rowMappingSource.rowMappings[i].propertyName;
        fieldMapping.rowId = rowMappingSource.rowMappings[i].rowId;
        this.rowHeaderMappingArray.push(fieldMapping);
        this.rowIdList.push(fieldMapping.rowId);
        this.rowHeaderList.push({
          rowId: fieldMapping.rowId,
          rowHeader: '',
        });
        this.fieldDataSourceWizard = new MatTableDataSource(this.rowHeaderMappingArray);
      }
    }
  }

  openViewModelChangeDialog()  {
    const dialogRef = this.dialog.open(ViewModelConfigComponent, {
      panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
      data: {
        projectUid: this.projectUid,
        pageId: this.pageId,
      }
    });
    dialogRef.afterClosed(
    ).subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  deleteaddAIOTableRow(apiDetail) {
    const index = this.apiResourceDetails.indexOf(apiDetail);
    this.apiResourceDetails.splice(index, 1);

    if(this.apiResourceDetails.length) {
      this.removedAIOResourceData = true;
    }
    this.dataSourceAIOParam = new MatTableDataSource(this.apiResourceDetails);
  }

  addPanelRow() {
    const panelType = this.editForm.get(['panelType']).value;
    const panelName = this.editForm.get(['panelName']).value;
    const panelID = this.editForm.get(['panelID']).value;
    const dashboardUID = this.editForm.get(['dashboardUID']).value;
    const dashboardTitle = this.editForm.get(['dashboardTitle']).value;

    if (panelType === null || panelName === '' || !panelID || !dashboardUID || !dashboardTitle) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warn',
        detail: 'Please fill all the fields',
      });
    } else {
      const panel = {
        panelName,
        panelType,
        panelID,
        dashboardUID,
        dashboardTitle,
      };

      this.dashboardPanelDetails.push(panel);
    }
  }

  deletePanelRow(panel) {
    const index = this.dashboardPanelDetails.indexOf(panel);
    this.dashboardPanelDetails.splice(index, 1);
  }

  loadAggregates(selectedAggregate? : IAggregate) {
    let selectedAggr;
    this.aggregateItems = []
    for (let i = 0; i < this.aggregates.length; i++) {
      if (this.aggregates[i].status === 'ENABLED') {
        const dropdownLabel = this.aggregates[i].name;
        this.aggregateItems.push({ label: dropdownLabel, value: this.aggregates[i] });
      }
      if (selectedAggregate && selectedAggregate.uuid === this.aggregates[i].uuid) {
        selectedAggr = this.aggregates[i];
      }
      if (selectedAggr) {
        this.editForm.patchValue({
          selectedAggregate: selectedAggr,
        });
      }
    }
  }

  loadMicroservices() {
    this.microserviceService
        .findByProjectId(this.projectUid, this.projectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<IProject[]>) => mayBeOk.ok),
            map((response: HttpResponse<IProject[]>) => response.body)
        )
        .subscribe(
            (res: IProject[]) => {
              this.microservices = res;
              this.loadMicroserviceDropdownItems();
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }

  loadAllPages() {
    if (this.projectUid) {
      this.builtInPageService
          .findBuiltInPagesForProjectId(this.projectUid, this.projectUid)
          .pipe(
              filter((res: HttpResponse<IPage[]>) => res.ok),
              map((res: HttpResponse<IPage[]>) => res.body)
          )
          .subscribe(
              (res: IPage[]) => {
                this.allpages = [];
                for(const page of res) {
                  if (page.uuid !== this.pageId) {
                    this.allpages.push(page);
                  }
                }
                this.loadPages();
              },
              (res: HttpErrorResponse) => this.onError(res.message)
          );}
  }

  loadPages() {
    this.pages = [];
    for (let i = 0; i < this.allpages.length; i++) {
      const dropdownLabel = this.allpages[i].pagetitle;
      this.pages.push({ label: dropdownLabel, value: this.allpages[i] });
    }
  }

  loadUpdateForm() {
    this.builtInPageService
        .find(this.pageId ,this.projectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<IPage>) => mayBeOk.ok),
            map((response: HttpResponse<IPage>) => response.body)
        )
        .subscribe(
            (res: IPage) => {
              this.currentPage = res;
              this.loadAllSourceTargetFormFieldsForPage(res);
              // this.BTN_ELEMENT_DATA = this.currentPage.buttonPanel;
              //  this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
              this.updateForm(res);
            });
    // this.activatedRoute.data.subscribe(({ builtInPage }) => {
    //   this.currentPage = builtInPage;
    //   this.updateForm(builtInPage);
    // });
  }

  onChangeMicroserviceAPI() {
    const microservice = this.editForm.get(['microservice']).value;
    const api = this.editForm.get(['api']).value;
    if (api && api.api) {
      const apiStart: boolean = api.api.resourcePath.startsWith('/');
      let suggestedPath = '';
      if (apiStart) {
        suggestedPath = '/' + microservice.name + '/api' + api.api.resourcePath;
      } else {
        suggestedPath = '/' + microservice.name + '/api/' + api.api.resourcePath;
      }
      if (api.api.apiJson && api.api.apiJson.operation) {
        const op = api.api.apiJson.operation;
        if (op === 'CREATE' || op === 'UPDATE' || op === 'FIND' || op === 'DELETE') {
          this.editForm.get('apiOperation').patchValue(op, { emitEvent: true });
          this.editForm.get('resPathMethod').patchValue(op === 'CREATE' ? 'POST' : op === 'UPDATE' ? 'PUT' : op === 'FIND' ? 'GET' : op === 'DELETE' ? 'DELETE' : '', { emitEvent: true });
        }
      }
      this.editForm.get('resourcePath').patchValue(suggestedPath, { emitEvent: true });
    }
  }

  onChangeMicroserviceAPI2() {
    const microservice = this.editForm.get(['microservice2']).value;
    const api = this.editForm.get(['api2']).value;
    if (api && api.api) {
      const apiStart: boolean = api.api.resourcePath.startsWith('/');
      let suggestedPath = '';
      if (apiStart) {
        suggestedPath = '/' + microservice.name + '/api' + api.api.resourcePath;
      } else {
        suggestedPath = '/' + microservice.name + '/api/' + api.api.resourcePath;
      }
      if (api.api.apiJson && api.api.apiJson.operation) {
        const op = api.api.apiJson.operation;
        if (op === 'CREATE' || op === 'UPDATE' || op === 'FIND' || op === 'DELETE') {
          this.editForm.get('apiOperation2').patchValue(op, { emitEvent: true });
          this.editForm.get('resPathMethod2').patchValue(op === 'CREATE' ? 'POST' : op === 'UPDATE' ? 'PUT' : op === 'FIND' ? 'GET' : op === 'DELETE' ? 'DELETE' : '', { emitEvent: true });
        }
      }
      this.editForm.get('resourcePath2').patchValue(suggestedPath, { emitEvent: true });
    }
  }

  updateResourcePath() {
      const page = this.currentPage;
      page.resourcePath = this.editForm.get(['resourcePath']).value;
      page.onLoadResourcePath = this.editForm.get(['resourcePath2']).value;
      this.updatePageResourcePath(page);
  }

  onChangeAioTableMicroserviceAPI() {
    const microservice = this.editForm.get(['aiomicroservice']).value;
    const api = this.editForm.get(['aioapi']).value;
    if (api && api.api) {
      const apiStart: boolean = api.api.resourcePath.startsWith('/');
      let suggestedPath = '';
      if (apiStart) {
        suggestedPath = '/' + microservice.name + '/api' + api.api.resourcePath;
      } else {
        suggestedPath = '/' + microservice.name + '/api/' + api.api.resourcePath;
      }
      if (api.api.apiJson && api.api.apiJson.operation) {
        const op = api.api.apiJson.operation;
        if (op === 'CREATE' || op === 'UPDATE' || op === 'FIND' || op === 'DELETE') {
          this.editForm.get('apiOperation').patchValue(op, { emitEvent: true });
          this.editForm.get('resPathMethod').patchValue(op === 'CREATE' ? 'POST' : op === 'UPDATE' ? 'PUT' : op === 'FIND' ? 'GET' : op === 'DELETE' ? 'DELETE' : '', { emitEvent: true });
        }
      }
      this.editForm.get('apiResourcePath').patchValue(suggestedPath, { emitEvent: true });
    }
  }

  onchangePageTemplate() {
    this.apiItems = [];
    this.panelItems = [];
  }

  onChangeMicroserviceProject() {
    this.apiItems = [];
    const microservice = this.editForm.get(['microservice']).value;
    this.editForm.get('resourcePath').patchValue('', { emitEvent: true });
    this.editForm.get('resPathMethod').patchValue('', { emitEvent: true });
    this.editForm.get('api').patchValue([], { emitEvent: true });

    if (microservice.microserviceApis) {
      for (let i = 0; i < microservice.microserviceApis.length; i++) {
        const apiObj: IPageApi = {
          apiType: 'API',
          api: microservice.microserviceApis[i],
        };
        const dropdownLabel = microservice.microserviceApis[i].name;
        this.apiItems.push({ label: dropdownLabel, value: apiObj });
      }
    }

    if (microservice.commands) {
      for (let i = 0; i < microservice.commands.length; i++) {
        const commandObj: IPageApi = {
          apiType: 'COMMAND',
          api: microservice.commands[i],
        };
        const dropdownLabel = microservice.commands[i].name;
        this.apiItems.push({ label: dropdownLabel, value: commandObj });
      }
    }

    if (microservice.queries) {
      for (let i = 0; i < microservice.queries.length; i++) {
        const queryObj: IPageApi = {
          apiType: 'QUERY',
          api: microservice.queries[i],
        };
        const dropdownLabel = microservice.queries[i].name;
        this.apiItems.push({ label: dropdownLabel, value: queryObj });
      }
    }
  }


  onChangeMicroserviceProject2() {
    this.apiItems = [];
    const microservice = this.editForm.get(['microservice2']).value;
    this.editForm.get('resourcePath2').patchValue('', { emitEvent: true });
    this.editForm.get('resPathMethod2').patchValue('', { emitEvent: true });
    this.editForm.get('api2').patchValue([], { emitEvent: true });

    if (microservice.microserviceApis) {
      for (let i = 0; i < microservice.microserviceApis.length; i++) {
        const apiObj: IPageApi = {
          apiType: 'API',
          api: microservice.microserviceApis[i],
        };
        const dropdownLabel = microservice.microserviceApis[i].name;
        this.apiItems.push({ label: dropdownLabel, value: apiObj });
      }
    }

    if (microservice.commands) {
      for (let i = 0; i < microservice.commands.length; i++) {
        const commandObj: IPageApi = {
          apiType: 'COMMAND',
          api: microservice.commands[i],
        };
        const dropdownLabel = microservice.commands[i].name;
        this.apiItems.push({ label: dropdownLabel, value: commandObj });
      }
    }

    if (microservice.queries) {
      for (let i = 0; i < microservice.queries.length; i++) {
        const queryObj: IPageApi = {
          apiType: 'QUERY',
          api: microservice.queries[i],
        };
        const dropdownLabel = microservice.queries[i].name;
        this.apiItems.push({ label: dropdownLabel, value: queryObj });
      }
    }
  }

  onChangeAioTableMicroserviceProject() {
    this.apiItems = [];
    const microservice = this.editForm.get(['aiomicroservice']).value;
    this.editForm.get('apiResourcePath').patchValue('', { emitEvent: true });
    this.editForm.get('apiOperation').patchValue('', { emitEvent: true });
    this.editForm.get('aioapi').patchValue([], { emitEvent: true });

    if (microservice.microserviceApis) {
      for (let i = 0; i < microservice.microserviceApis.length; i++) {
        const apiObj: IPageApi = {
          apiType: 'API',
          api: microservice.microserviceApis[i],
        };
        const dropdownLabel = microservice.microserviceApis[i].name;
        this.apiItems.push({ label: dropdownLabel, value: apiObj });
      }
    }

    if (microservice.commands) {
      for (let i = 0; i < microservice.commands.length; i++) {
        const commandObj: IPageApi = {
          apiType: 'COMMAND',
          api: microservice.commands[i],
        };
        const dropdownLabel = microservice.commands[i].name;
        this.apiItems.push({ label: dropdownLabel, value: commandObj });
      }
    }

    if (microservice.queries) {
      for (let i = 0; i < microservice.queries.length; i++) {
        const queryObj: IPageApi = {
          apiType: 'QUERY',
          api: microservice.queries[i],
        };
        const dropdownLabel = microservice.queries[i].name;
        this.apiItems.push({ label: dropdownLabel, value: queryObj });
      }
    }
  }

  loadMicroserviceProjects() {
    this.projectService
        .findAllMicroserviceProjects()
        .pipe(
            filter((mayBeOk: HttpResponse<IProject[]>) => mayBeOk.ok),
            map((response: HttpResponse<IProject[]>) => response.body)
        )
        .subscribe(
            (res: IProject[]) => {
              this.microserviceProjects = res;
              this.loadMicroserviceProjectDropdownItems();
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }

  onChangeMicroservice() {
    this.apiItems = [];
    const microservice = this.editForm.get(['microservice']).value;
    this.microserviceService
        .findApis(microservice.masterUuid, this.projectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<string[]>) => mayBeOk.ok),
            map((response: HttpResponse<string[]>) => response.body)
        )
        .subscribe(
            (res: string[]) => {
              if (res) {
                for (let i = 0; i < res.length; i++) {
                  const dropdownLabel = res[i];
                  this.apiItems.push({ label: dropdownLabel, value: res[i] });
                }
              }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }

  notifyModelChange(currentDatamodel: IAggregate) {
    const selectedModel: IAggregate = this.editForm.get(['selectedAggregate']).value;
    this.eventManager.dispatch(
        new AppEvent(EventTypes.newViewModelCreation, {
          name: 'newViewModelCreation',
          content: currentDatamodel.uuid,
        })
    );
  }

  loadMicroserviceDropdownItems() {
    for (let i = 0; i < this.microservices.length; i++) {
      if (this.microservices[i].status === 'ENABLED') {
        const dropdownLabel = this.microservices[i].name;
        this.microserviceItems.push({ label: dropdownLabel, value: this.microservices[i] });
      }
    }
  }

  loadMicroserviceProjectDropdownItems() {
    this.microserviceProjectItems = [];
    for (let i = 0; i < this.microserviceProjects.length; i++) {
      const dropdownLabel = this.microserviceProjects[i].displayName;
      this.microserviceProjectItems.push({ label: dropdownLabel, value: this.microserviceProjects[i] });
    }
  }

  loadDashboardProjectDropdownItems() {
    if (this.dashboardProjects) {
      for (let i = 0; i < this.dashboardProjects.length; i++) {
        const dropdownLabel = this.dashboardProjects[i].displayName;
        this.dashboardProjectItems.push({ label: dropdownLabel, value: this.dashboardProjects[i] });
      }
    }
  }

  updateForm(builtInPage: IPage) {
    this.editPageAsJson = builtInPage.inputPageAsJson;
    this.code = builtInPage.pageJson;
    if (builtInPage.model && builtInPage.model.config) {
      this.loadModelPropertyList();
    }
    if (builtInPage.authority) {
      this.editForm.patchValue({
        isSecurePage: true,
      });
    }
    if (this.project.apptypesID === 'task.ui') {
      if (builtInPage.pagetemplate === 'register-page') {
        this.pageTemplateItems.push({ label: 'Register Page', value: 'register-page' });
      } else if (builtInPage.pagetemplate === 'login-page') {
        this.pageTemplateItems.push({ label: 'Login Page', value: 'login-page' });
        if (builtInPage.loginParams) {
          this.loginParams = builtInPage.loginParams;
          this.dataSourceLogin = new MatTableDataSource(this.loginParams);
        }
        if(builtInPage.landingPageRoleMappings) {
          this.landingPageMapping = builtInPage.landingPageRoleMappings
          this.dataSourceLandingPageMapping = new MatTableDataSource(this.landingPageMapping);
        }
      }
      if (builtInPage.pagetemplate !== 'aio-table' && builtInPage.pagetemplate !== 'aio-grid' && builtInPage.params) {
        if (builtInPage.params) {
          this.apiParams = builtInPage.params;
        }
      }
      if (builtInPage.pagetemplate === 'tile-page' || builtInPage.pagetemplate === 'aio-grid') {
        if (builtInPage.tileFields) {
          this.TILE_DATA = builtInPage.tileFields;
          this.dataSourceTile = new MatTableDataSource(this.TILE_DATA);
        }
      }
      if(builtInPage.buttonEvents) {
        this.btnEventActionList = builtInPage.buttonEvents
        this.eventDataSource = new MatTableDataSource(this.btnEventActionList);
      }
     // if (builtInPage.pagetemplate === 'aio-table' || (builtInPage.pagetemplate === 'aio-grid' && builtInPage.apiResourceDetails)) {
        if (builtInPage.apiResourceDetails) {
          this.apiResourceDetails =[];
          this.apiResourceDetails = builtInPage.apiResourceDetails;
          this.dataSourceAIOParam = new MatTableDataSource(this.apiResourceDetails);
        }
      // } else if (builtInPage.pagetemplate === 'dashboard-page' && builtInPage.dashboardPanelDetails) {
      //   this.dashboardPanelDetails = builtInPage.dashboardPanelDetails;
      // }
      this.editForm.patchValue({
        id: builtInPage.uuid,
        apiType: builtInPage.apiType,
        selectedAggregate: builtInPage.model,
        resPathMethod: builtInPage.resourcePathMethod,
        resourcePath: builtInPage.resourcePath,
        resourcePath2: builtInPage.onLoadResourcePath,
        pageDescription: builtInPage.pageDescription,
        backgroundUrl: builtInPage.backgroundImageURL,
        pageBackgroundColor: builtInPage.pageBackgroundColor,
        widgetAlignment: builtInPage.widgetAlignment,
        //  operation: builtInPage.operation,
        pagetitle: builtInPage.pagetitle,
        pagetemplate: builtInPage.pagetemplate,
        authority: builtInPage.authority,
        projectUuid: this.projectUid,
        isHomepage: builtInPage.isHomepage,
        wizardLayout: builtInPage.tabLayout
      });
      if (builtInPage && builtInPage.stepHeaders && builtInPage.stepHeaders.length > 0) {
        // this.wizardDetailsGroup.removeAt(0);
        // this.detailsHeaderGroup.removeAt(0);
        // for (const steph of builtInPage.stepHeaders) {
        //   if(builtInPage.pagetemplate === 'form-wizard-page') {
        //     this.insertWizardDetailsGroup(steph.stepHeader);
        //   } else if (builtInPage.pagetemplate === 'static-page') {
        //     this. insertDetailsHeaderGroup(steph.stepHeader);
        //   }
        // }
      }
      if (builtInPage && builtInPage.tileFields && builtInPage.tileFields.length > 0) {
        if(builtInPage.pagetemplate === 'tile-page' || builtInPage.pagetemplate === 'aio-grid') {
          this.TILE_DATA = builtInPage.tileFields;
          this.dataSourceTile = new MatTableDataSource(this.TILE_DATA);
        } else if (builtInPage.pagetemplate === 'static-page') {
          this.headerFieldArr = builtInPage.stepMappings;
          this.dataSourceDetailsPage = new MatTableDataSource( this.headerFieldArr);
        }
      }
      if (builtInPage && builtInPage.stepMappings && builtInPage.stepMappings.length > 0) {
        if(builtInPage.pagetemplate === 'form-wizard-page') {
          this.stepFieldArr = builtInPage.stepMappings;
          this.dataSourceWizard = new MatTableDataSource(this.stepFieldArr);
        } else if (builtInPage.pagetemplate === 'static-page') {
          this.headerFieldArr = builtInPage.stepMappings;
          this.dataSourceDetailsPage = new MatTableDataSource( this.headerFieldArr);
        }
      }
      if (builtInPage.pagetemplate === 'chart-page' && builtInPage.chartDetails) {
        this.editForm.patchValue({
          chartType: builtInPage.chartDetails.chartType,
          barChartAxis: builtInPage.chartDetails.barChartAxis,
          donutArcsize: builtInPage.chartDetails.donutChartArcSize,
          chartHeight: builtInPage.chartDetails.chartHeight,
          showLegend: builtInPage.chartDetails.showLegend,
        })
      }
      this.pageTitle = builtInPage.pagetitle;
      this.pageDescription = builtInPage.pageDescription;
      this.backgroundImage = builtInPage.backgroundImageURL;
      if(builtInPage.actions && builtInPage.actions.buttons && builtInPage.actions.buttons.child ) {
        this.BTN_ELEMENT_DATA = builtInPage.actions.buttons.child;
        this.dataSource = new MatTableDataSource(this.BTN_ELEMENT_DATA);
      }
      if(builtInPage.rowMappings) {
        this.rowHeaderMappingArray = builtInPage.rowMappings;
        this.fieldDataSourceWizard = new MatTableDataSource(this.rowHeaderMappingArray);
        this.rowHeaderList = builtInPage.rowHeaders;
      }
    }
    this.pagestyle = builtInPage.pagestyle;
    this.loadAggregates(builtInPage.model);
    this.isBGUrlEdit = false;
    this.isDescEdit = false;
    this.isTitleEdit = false;
  }

  getPageTemplates() {
    if (this.project.apptypesID === 'task.ui') {
      if (!this.isLoginPageExist) {
        this.pageTemplateItems.push({ label: 'Login Page', value: 'login-page' });
      }
      if (!this.isRegisterPageExist) {
        this.pageTemplateItems.push({ label: 'Register Page', value: 'register-page' });
      }
      this.pageTemplateItems.push({ label: 'Table View', value: 'table-page' });
      this.pageTemplateItems.push({ label: 'Form View', value: 'form-page' });
      this.pageTemplateItems.push({ label: 'Form Wizard View', value: 'form-wizard-page' });
      this.pageTemplateItems.push({ label: 'Grid View', value: 'aio-grid' });
      this.pageTemplateItems.push({ label: 'All-in-One Table View', value: 'aio-table' });
      this.pageTemplateItems.push({ label: 'File Upload View', value: 'file-upload-page' });
    } else {
      this.pageTemplateItems.push({ label: 'Table View', value: 'aio-table' });
      this.pageTemplateItems.push({ label: 'Grid View', value: 'aio-grid' });
    }
  }

  loadEntities() {
    for (let i = 0; i < this.datamodels.length; i++) {
      if (this.datamodels[i].status === 'ENABLED') {
        const dropdownLabel = this.datamodels[i].name;
        this.datamodelItems.push({ label: dropdownLabel, value: this.datamodels[i] });
      }
    }
  }

  previousState() {
    const url = 'model-page/proj/' + this.projectUid;
    this.router.navigate([url]);
  }

  save(builtInPage: IPage) {
    this.isSaving = true;
    if (builtInPage.uuid) {
      this.subscribeToSaveResponse(this.builtInPageService.update(builtInPage, this.projectUid));
    } else {
      this.subscribeToSaveResponse(this.builtInPageService.create(builtInPage, this.projectUid));
    }
  }

  updatePageResourcePath(builtInPage: IPage) {
    this.isSaving = true;
    if (builtInPage.uuid && builtInPage.resourcePath) {
      this.subscribeToSaveResponse(this.builtInPageService.updateResourcePath(builtInPage, this.projectUid));
    }
  }

  updatePageBasicData(builtInPage: IPage) {
    this.isSaving = true;
    if (builtInPage.uuid && builtInPage.pagetitle) {
      this.subscribeToSaveResponse(this.builtInPageService.updatePageBasicData(builtInPage, this.projectUid));
    }
  }

  updatePageActions(builtInPage: IPage) {
    this.isSaving = true;
    if (builtInPage.uuid && builtInPage.actions) {
      this.subscribeToSaveResponse(this.builtInPageService.updatePageActions(builtInPage, this.projectUid));
    }
  }

  updatePageFieldHeaderMappings(builtInPage: IPage) {
    this.isSaving = true;
    if (builtInPage.uuid) {
      this.subscribeToSaveResponse(this.builtInPageService.updatePageFieldHeaderMappings(builtInPage, this.projectUid));
    }
  }

  updatePageLoginInputs(builtInPage: IPage) {
    this.isSaving = true;
    if (builtInPage.uuid) {
      this.subscribeToSaveResponse(this.builtInPageService.updatePageLoginInputs(builtInPage, this.projectUid));
    }
  }

  updateAIOPageResourceData(builtInPage: IPage) {
    this.isSaving = true;
    if (builtInPage.uuid) {
      this.subscribeToSaveResponse(this.builtInPageService.updateAIOPageResourceData(builtInPage, this.projectUid));
    }
  }

  // private createFromForm(): IPage {
  //   let headersArray = [];
  //   let fieldMappingArray = [];
  //   let chartDetails;
  //   if(!(this.BTN_ELEMENT_DATA.length > 0)) {
  //   //  this.addDefaultBtns();
  //   }
  //   if (this.project.apptypesID === 'task.ui') {
  //     if (this.editForm.get(['pagetemplate']).value === 'aio-table') {
  //       this.dashboardPanelDetails = [];
  //     } else if (this.editForm.get(['pagetemplate']).value === 'dashboard-page') {
  //       this.apiResourceDetails = [];
  //       this.apiParams = [];
  //     }
  //     if(this.currentPage.pagetemplate === 'static-page') {
  //       headersArray = this.stepHeadersList;
  //       fieldMappingArray = this.headerFieldArr;
  //     } else {
  //       headersArray = this.stepHeadersList;
  //    //   fieldMappingArray = this.stepFieldTempArr;
  //     }
  //     if (this.currentPage.pagetemplate === 'chart-page') {
  //       chartDetails = new ChartDetails();
  //       chartDetails.ChartType = this.editForm.get(['chartType']).value;
  //       chartDetails.ChartHeight = this.editForm.get(['chartHeight']).value;
  //       chartDetails.BarChartAxis = this.editForm.get(['barChartAxis']).value;
  //       chartDetails.DonutChartArcSize = this.editForm.get(['donutArcsize']).value;
  //       chartDetails.ShowLegend = this.editForm.get(['showLegend']).value;
  //     }
  //     this.actions.buttons.child = this.BTN_ELEMENT_DATA;
  //     return {
  //       ...new Page(),
  //       uuid: this.editForm.get(['id']).value,
  //       model: this.editForm.get(['selectedAggregate']).value,
  //       pagetitle: this.editForm.get(['pagetitle']).value,
  //       pageDescription: this.editForm.get(['pageDescription']).value,
  //       pagetemplate: this.editForm.get(['pagetemplate']).value,
  //       pagetype: 'api-page',
  //       params: this.apiParams,
  //       loginParams: this.loginParams,
  //       apiResourceDetails: this.apiResourceDetails,
  //       dashboardPanelDetails: this.dashboardPanelDetails,
  //       resourcePathMethod: this.editForm.get(['resPathMethod']).value,
  //       resourcePath: this.editForm.get(['resourcePath']).value,
  //       status: 'ENABLED',
  //       projectUuid: this.projectUid,
  //       pagestyle: this.pagestyle,
  //       pageViewType: 'singleWidget',
  //       stepHeaders: headersArray,
  //       stepMappings: fieldMappingArray,
  //       authority: this.editForm.get(['authority']).value,
  //       isHomepage: this.editForm.get(['isHomepage']).value,
  //       actions: this.actions,
  //       rowHeaders: this.rowHeaderList,
  //       rowMappings: this.rowHeaderMappingArray,
  //       tabLayout: this.editForm.get(['wizardLayout']).value,
  //       chartDetails,
  //       tileFields: this.TILE_DATA,
  //       tileFieldCount: this.editForm.get(['tileFieldCount']).value,
  //       buttonEvents: this.btnEventActionList
  //     };
  //   }
  // }

  savePageHeaderAndFieldMappings() {
    let fieldMappingArray = [];
    if(this.currentPage.pagetemplate === 'static-page') {
      fieldMappingArray = this.headerFieldArr;
    } else {
      fieldMappingArray = this.stepFieldArr;
    }
    const page = this.currentPage;
    page.stepMappings = fieldMappingArray;
    this.updatePageFieldHeaderMappings(page);
  }

  savePageLoginInputs() {
    let loginParams = [];
    if(this.currentPage.pagetemplate === 'login-page' && this.loginParams.length > 0) {
      loginParams = this.loginParams;
    }
    const page = this.currentPage;
    page.loginParams = loginParams;
    this.updatePageLoginInputs(page);
  }

  saveAIOPageResourceData() {
    const page = this.currentPage;
    page.apiResourceDetails = this.apiResourceDetails;
    this.updateAIOPageResourceData(page);
  }

  getChangedPageModel(currentDatamodel){
    return {
      ...this.currentPage,
      rowMappings: [],
      rowHeader: [],
      stepHeaders: [],
      stepMappings: [],
      params: [],
      loginParams: [],
      model: currentDatamodel,
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPage>>) {
    result.subscribe(
        () => this.onSaveSuccess(),
        () => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    this.isSaving = false;
    if (this.editForm.get(['pagetitle']).value !== this.currentPage.pagetitle){
      this.eventManager.dispatch(
          new AppEvent(EventTypes.editorUITreeListModification, {
            name: 'editorUITreeListModification',
            content: 'UI tree edited',
          })
      );
    }
    this.pageTitle = this.editForm.get(['pagetitle']).value;
    this.loadPage(true);
  }

  protected onSaveError() {
    // this.spinnerService.hide();
    this.isSaving = false;
    this.messageService.add({ severity: 'error', summary: 'error', detail: 'Error' });
  }

  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }

  trackDatamodelById(index: number, item: IDatamodel) {
    return item.uuid;
  }

  ngOnDestroy() {
    // this.eventSubscriber.unsubscribe();
    // this.toolbarTrackerService.setProjectUUID('');
    // this.toolbarTrackerService.setIsEntityPage('no');
    // this.toolbarTrackerService.setIsPageLayout('no');
  }

  editPageTitle() {
    this.isTitleEdit = !this.isTitleEdit;
  }

  editPageDesc() {
    this.isDescEdit = !this.isDescEdit;
  }
  editBGUrl() {
    this.isBGUrlEdit = !this.isBGUrlEdit;
  }

  createModel() {
    const dialogRef = this.dialog.open(CreateModelComponent, {
      panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
      data: {
        projectUid: this.projectUid,
        createStatus: 'Create',
        uuid: this.pageId,
        appType: 'task.ui'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  backSidebar($event) {
    this.isSidebarVisible = $event;
    if (this.isSidebarVisible) {
      this.sidebar = !this.sidebar;
    }
    this.isSelected = false;
  }

  backSidebarModel($event) {
    this.isSidebarVisible = $event;
    this.isSelected = false;
  }

  aggregate($event) {
  }

  checkPageNameExist() {
   // const page = this.createFromForm();
    const page = this.currentPage;
    page.pagetitle = this.editForm.get(['pagetitle']).value;
    page.pageDescription = this.editForm.get(['pageDescription']).value;
    page.inputPageAsJson = this.editPageAsJson;
    page.pageJson = this.code;
    this.builtInPageService
        .findPageNameAvailability(page.pagetitle, this.currentPage.uuid, this.projectUid)
        .pipe(
            filter((res: HttpResponse<any>) => res.ok),
            map((res: HttpResponse<any>) => res.body)
        )
        .subscribe(
            (res: any) => {
              if (res.IsNameExist) {
                this.consoleLogService.writeConsoleLog('Page name exists');
              } else {
                this.consoleLogService.writeConsoleLog('Page saved successfully');
                this.save(page);
              }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }


  savePageAsJson() {
    const page = this.currentPage;
    page.inputPageAsJson = this.editPageAsJson;
    page.pageJson = this.code;
    if(page.inputPageAsJson && page.pageJson) {
    this.builtInPageService
        .savePageAsJson(page, this.projectUid)
        .pipe(
            filter((res: HttpResponse<any>) => res.ok),
            map((res: HttpResponse<any>) => res.body)
        )
        .subscribe(
            (res: any) => {
              this.consoleLogService.writeConsoleLog('Page json saved successfully');
                this.save(page);
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }
  }


  checkAndUpdatePageName() {
    // const page = this.createFromForm();
    const page = this.currentPage;
    page.inputPageAsJson = this.editPageAsJson;
    page.pagetitle = this.editForm.get(['pagetitle']).value;
    page.backgroundImageURL = this.editForm.get(['backgroundUrl']).value;
    page.pageBackgroundColor = this.editForm.get(['pageBackgroundColor']).value;
    page.widgetAlignment = this.editForm.get(['widgetAlignment']).value;
    page.pageDescription = this.editForm.get(['pageDescription']).value;
    this.builtInPageService
        .findPageNameAvailability(page.pagetitle, this.currentPage.uuid, this.projectUid)
        .pipe(
            filter((res: HttpResponse<any>) => res.ok),
            map((res: HttpResponse<any>) => res.body)
        )
        .subscribe(
            (res: any) => {
              if (res.IsNameExist) {
                this.consoleLogService.writeConsoleLog('Page name exists');
              } else {
                this.consoleLogService.writeConsoleLog('Page saved successfully');
                this.updatePageBasicData(page);
                this.editPageTitle();
              }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }

  sidenavClosed() {
    this.sidebar = false;
    this.activatedRoute.params.subscribe(params => {
      this.projectService
          .findWithModels(this.projectUid)
          .pipe(
              filter((mayBeOk: HttpResponse<IProject>) => mayBeOk.ok),
              map((response: HttpResponse<IProject>) => response.body)
          )
          .subscribe(
              (res: IProject) => {
                this.project = res;
                this.getPageTemplates();
                if (this.project.apptypesID === 'task.ui') {
                  this.aggregates = this.project.aggregates;
                  if (this.aggregates) {
                    this.loadAggregates();
                  }
                } else {
                  this.datamodels = this.project.datamodels;
                  this.datamodelItems = [];
                  this.loadEntities();
                }
              },
              (res: HttpErrorResponse) => this.onError(res.message)
          );
    });
  }

  loadAllPageConfig() {
    this.pageConfigService
        .query(null, this.projectUid)
        .pipe(
            filter((res: HttpResponse<IPageConfig[]>) => res.ok),
            map((res: HttpResponse<IPageConfig[]>) => res.body)
        )
        .subscribe(
            (res: IPageConfig[]) => {
              // this.configs = res;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }

  loadPageConfigsByPageId(pageId: string, uuid: string) {
    if (!pageId) {
      this.loadAllPageConfig();
    } else {
      // this.spinnerService.show();
      this.pageConfigService
          .findPageConfigsForPageId(pageId, uuid)
          .pipe(
              filter((res: HttpResponse<IPageConfig>) => res.ok),
              map((res: HttpResponse<IPageConfig>) => res.body)
          )
          .subscribe(
              (res: IPageConfig) => {
                this.configs = res;
                this.pageConfigs = this.configs.pageConfigs;
                // this.spinnerService.hide();
              },
              (res: HttpErrorResponse) => this.onError(res.message)
          );
    }
  }

  addFieldsToSteps(header, fields) {
    const field = fields;
    const stepHeader = header;
    const stepId = this.stepFieldArr.length;
    // if (this.editForm.get(['stepHeader']).value) {
    //   stepId = parseInt(this.editForm.get(['stepHeader']).value.split('-')[0]);
    //   stepHeader = this.editForm.get(['stepHeader']).value.split('-')[1];
    // }

    const stepField = {
      field,
      stepHeader,
      stepId,
    };
    if (this.stepFieldArr.indexOf(stepField) === -1) {
      this.stepFieldArr.push(stepField);
      //  this.ELEMENT_DATA.push(stepField);
      this.dataSourceWizard = new MatTableDataSource(this.stepFieldArr);
    }
  }
  // Temporary
  // addFieldsToStepsTemp(header, fields) {
  //   this.stepHeadersList.push(header);
  //   const stepId = this.stepFieldTempArr.length;
  //   if (!fields || !stepId) {
  //     this.messageService.add({
  //       severity: 'warn',
  //       summary: 'Warn',
  //       detail: 'Please fill all the fields',
  //     });
  //   } else {
  //     for (const field of fields) {
  //       const stepField = {
  //         field,
  //         header,
  //         stepId,
  //       };
  //       if (this.stepFieldTempArr.indexOf(stepField) === -1) {
  //         this.stepFieldTempArr.push(stepField);
  //       }
  //     }
  //   }
  // }
  // removeWizardDetailsGroup(index: number) {
  //   this.wizardDetailsGroup.removeAt(index);
  //   this.saveAllWizardSteps();
  // }

  // saveAllWizardSteps() {
  //   this.stepHeadersList = [];
  //   const allStepControllers = this.wizardDetailsGroup.controls;
  //   for (let i = 0; i < allStepControllers.length; i++) {
  //     this.stepHeadersList.push({
  //       label: allStepControllers[i].value.stepHeading,
  //       value: allStepControllers[i].value.stepId + '-' + allStepControllers[i].value.stepHeading,
  //     });
  //   }
  // }

  // getAllWizardSteps(group) {
  //   const wizardStepObjArray = [];
  //   let allStepControllers = []
  //   if (group === 'wizard') {
  //     allStepControllers = this.restructureMappings();
  //   } else {
  //     allStepControllers = this.detailsHeaderGroup.controls;
  //   }
  //   for (let i = 0; i < allStepControllers.length; i++) {
  //     const wizardStepObj = {
  //       StepHeader: allStepControllers[i].controls.stepHeading.value,
  //       StepId: allStepControllers[i].controls.stepId.value,
  //     };
  //     wizardStepObjArray.push(wizardStepObj);
  //   }
  //   return wizardStepObjArray;
  // }

  deleteFieldSteps(param) {
    const index = this.stepFieldArr.indexOf(param);
    this.stepFieldArr.splice(index, 1);
    if(this.stepFieldArr.length === 0) {
      this.removedAllSteppers = true;
    }
    this.dataSourceWizard = new MatTableDataSource(this.stepFieldArr);
  }


  // get wizardDetailsGroup() {
  //   return this.editForm.get('wizardDetailsGroup') as FormArray;
  // }

  // insertWizardDetailsGroup(stepH) {
  //   this.stepIndexId = this.wizardDetailsGroup.length + 1;
  //   // this.stepIndexId++;
  //   this.wizardDetailsGroup.push(this.addWizardDetailsGroup(stepH));
  //   this.saveAllWizardSteps();
  // }

  insertWizardDetailsGroup(stepH) {
    const dialogRef = this.dialog.open(StepFieldMapperComponent, {
      panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
      data: {
        projectUid: this.projectUid,
        modelAttributes: this.modelAttributesList
      }
    });
    dialogRef.afterClosed(
    ).subscribe(result => {
      if(result && result.header && result.attributes.length>0) {
        const attrNameArray = [];
        for(const attr of result.attributes) {
          attrNameArray.push(attr.label);
        }
        this.addFieldsToSteps(result.header, attrNameArray.join(','))
      }
    });
  }

  addWizardDetailsGroup(stepH): FormGroup {
    let stepHeader = 'Step ' + this.stepIndexId;
    if (stepH) {
      stepHeader = stepH;
    }
    return new FormGroup({
      stepHeading: new FormControl(stepHeader),
      stepId: new FormControl(this.stepIndexId), // [TODO] should add validations
    });
  }


  get detailsHeaderGroup() {
    return this.editForm.get('detailsHeaderGroup') as FormArray;
  }
  insertDetailsHeaderGroup(stepH) {
    this.headerIndexId = this.detailsHeaderGroup.length + 1;
    // this.stepIndexId++;
    this.detailsHeaderGroup.push(this.addDetailsHeaderGroup(stepH));
    // this.saveAllWizardSteps();
  }
  addDetailsHeaderGroup(stepH): FormGroup {
    let detailHeader = 'Header ' + this.headerIndexId;
    if (stepH) {
      detailHeader = stepH;
    }
    return new FormGroup({
      stepHeading: new FormControl(detailHeader),
      stepId: new FormControl(this.headerIndexId),
    });
  }
  addFieldsToHeaders() {
    const field = this.editForm.get(['attributeName']).value;
    let stepHeader = '';
    let stepId = 0;
    if (this.editForm.get(['detailHeader']).value) {
      stepId = parseInt(this.editForm.get(['detailHeader']).value.split('-')[0]);
      stepHeader = this.editForm.get(['detailHeader']).value.split('-')[1];
    }

    if (!field || !stepId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warn',
        detail: 'Please fill all the fields',
      });
    } else {
      const stepField = {
        field,
        stepHeader,
        stepId,
      };
      if (this.headerFieldArr.indexOf(stepField) === -1) {
        this.headerFieldArr.push(stepField);
        this.dataSourceDetailsPage = new MatTableDataSource( this.headerFieldArr);
      }
    }
  }
  removeDetailsHeaderGroup(index: number) {
    this.detailsHeaderGroup.removeAt(index);
    this.getAllDetailsHeaders();
  }
  getAllDetailsHeaders() {
    this.detailsHeadersList = [];
    const allStepControllers = this.detailsHeaderGroup.controls;
    for (let i = 0; i < allStepControllers.length; i++) {
      this.detailsHeadersList.push({
        label: allStepControllers[i].value.stepHeading,
        value: allStepControllers[i].value.stepId + '-' + allStepControllers[i].value.stepHeading,
      });
    }
  }
  deleteFieldHeaders(param) {
    const index = this.headerFieldArr.indexOf(param);
    this.headerFieldArr.splice(index, 1);

    if(this.headerFieldArr.length === 0) {}
    this.removedAllSections = true;
    this.dataSourceDetailsPage = new MatTableDataSource(this.headerFieldArr);
  }




  onRowEditInit(car: Config) {
    this.clonedCars[car.property] = { ...car };
  }

  onRowEditSave(car: Config, index: number) {
    if (car.property_value !== '') {
      delete this.clonedCars[car.property];
      this.configs.pageConfigs = this.pageConfigs;

      if (this.configs.uuid) {
        this.subscribeToSaveResponse(this.pageConfigService.update(this.configs, this.projectUid));
      }
    } else {
      this.pageConfigs[index] = this.clonedCars[car.property];
      delete this.clonedCars[car.property];
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Value is required' });
    }
  }

  onRowEditCancel(car: Config, index: number) {
    this.pageConfigs[index] = this.clonedCars[car.property];
    delete this.clonedCars[car.property];
  }

  createMainMenu(){
    const dialogRef = this.dialog.open(MainMenuComponent, {
      panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
      data: {
        projectUid: this.projectUid,
        createStatus: status,
        uuid: this.currentPage.uuid,
        page: this.currentPage
      }
    });
    dialogRef.afterClosed(
    ).subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  // createPageNavigation(){
  //   const dialogRef = this.dialog.open(PageNavigationComponent, {
  //     panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
  //     data: {
  //       projectUid: this.projectUid,
  //       createStatus: status,
  //       uuid: this.currentPage.uuid,
  //       currentPage: this.currentPage,
  //       navigationParams: this.currentPage.navigationParams
  //     }
  //   });
  //   dialogRef.afterClosed(
  //   ).subscribe(result => {
  //     if (result) {
  //       this.navigationParams = result;
  //       this.checkPageNameExist()
  //     }
  //     // console.log(`Dialog resurelt: ${result}`);
  //   });
  // }
}
