import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IProject } from '@app/shared/models/model/project.model';
import {IDatamodel} from '@shared/models/model/datamodel.model';
import {IWidget, Widget} from '@shared/models/model/widget.model';
import {IInstalledMicroservice} from '@shared/models/model/installed-microservice.model';
import {Aggregate, IAggregate} from '@shared/models/model/aggregate.model';
import {APIInput} from '@shared/models/model/api-input.model';
import {Config, IConfig, IPageConfig} from '@shared/models/model/page-config.model';
import {SelectItem} from 'primeng/api';
import {BuiltInWidgetService} from '@core/projectservices/built-in-widget.service';
import {ProjectService} from '@core/projectservices/project.service';
import {MicroserviceInstallerService} from '@core/projectservices/microservice-installer.service';
import {EventManagerService} from '@shared/events/event.type';
import {AggregateService} from '@core/projectservices/microservice-aggregate.service';
import {PageConfigService} from '@core/projectservices/page-config.service';
import {IProperty} from '@shared/models/model/property.model';
import {EventTypes} from '@shared/events/event.queue';
import {AppEvent} from '@shared/events/app.event.class';
import {IPageApi} from '@home/pages/aggregate/microservice-add-model-constraints-dialog.component';
import {IPage} from '@shared/models/model/page.model';
interface Item {
  value: any;
  label: string;
}
@Component({
  selector: 'virtuan-single-widget-view',
  templateUrl: './single-widget.component.html',
  styleUrls: ['./built-in-page.component.scss'],
})
export class SingleWidgetComponent implements OnInit, OnDestroy {
  @Input() projectUid: string;
  isSaving: boolean;
  // projectId: number;
  project: IProject;
  datamodels: IDatamodel[];
  widgetTemplateItems: Item[];
  datamodelItems: Item[];
  currentWidget: IWidget;
  microservices: IInstalledMicroservice[];
  microserviceProjects: IProject[];
  dashboardProjects: IProject[];
  microserviceItems: Item[];
  microserviceProjectItems: Item[];
  dashboardProjectItems: Item[];
  modelPropertyList: Item[];
  apiItems: Item[];
  panelItems: Item[];
  aggregates: IAggregate[];
  aggregateItems: Item[];
  apiParams: APIInput[];
  apiResourceDetails: any[];
  dashboardPanelDetails: any[];
  // projectUid: string;
  loginParams: any[];
  isLoginPageExist: string;
  isRegisterPageExist: string;
  widgetTitle: string;
  pageConfigs: IConfig[];
  clonedCars: { [s: string]: Config } = {};
  pageId: string;
  widgetId: string;
  isSidebarVisible = false;
  rowValues = '';
  isSelected = false;
  createStatus: string;
  sidebar = false;
  aggregateId: string;
  configs: IPageConfig;
  pagestyle: string;
  stepFieldArr: any[] = [];
  stepHeadersList: SelectItem[] = [];
  stepIndexId = 1;
  eventSubscriber: Subscription;
  panelTypeItems: SelectItem[] = [
    { label: 'Graph', value: 'graph' },
    { label: 'Gauge', value: 'gauge' },
    { label: 'Logs', value: 'logs' },
    { label: 'Stat', value: 'stat' },
    { label: 'Bar Gauge', value: 'bargauge' },
    { label: 'Table', value: 'table' },
  ];

  crudItems: SelectItem[] = [
    { label: 'CREATE', value: 'CREATE' },
    { label: 'UPDATE', value: 'UPDATE' },
    { label: 'DELETE', value: 'DELETE' },
    { label: 'FIND', value: 'FIND' },
  ];
  loginInputs: SelectItem[] = [
    { label: 'User Name', value: 'UNAME' },
    { label: 'Password', value: 'password' },
  ];
  paramitems: SelectItem[] = [
    { label: 'Query', value: 'QUERY' },
    { label: 'Path', value: 'PATH' },
  ];
  paramDataTypeItems: SelectItem[] = [
    { label: 'TEXT', value: 'TEXT' },
    { label: 'NUMBER', value: 'NUMBER' },
    { label: 'FLOAT', value: 'FLOAT' },
    { label: 'TRUE_OR_FALSE', value: 'TRUE_OR_FALSE' },
    { label: 'DATE', value: 'DATE' },
  ];
  editForm: FormGroup;
  formDisable: boolean;
  buildNewForm() {
    this.editForm = this.fb.group({
      id: [],
      selectedDatamodel: [],
      pagetitle: ['', [Validators.required]],
      pagetemplate: ['', [Validators.required]],
      apiOperation: [],
      apiResourcePath: [],
      // operation: [],
      resourcePath: [],
      selectedAggregate: [],
      paramType: [],
      paramName: [],
      paramDataType: [],
      microservice: [],
      api: [],
      search: false,
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
      pageconfig: [],
    });
  }

  setCategoryModelValidators() {
    const apptype = this.project.apptypesID;

    this.editForm.get('pagetemplate').valueChanges.subscribe(pagetemplate => {
      if (apptype === 'task.ui') {
        this.editForm.get('selectedDatamodel').clearValidators();
        this.editForm.get('selectedDatamodel').updateValueAndValidity();

        if (pagetemplate === 'table-widget' || pagetemplate === 'form-widget' || pagetemplate === 'form-wizard-widget') {
          this.editForm.get('resourcePath').setValidators([Validators.required]);
          this.editForm.get('resourcePath').updateValueAndValidity();

          this.editForm.get('selectedAggregate').setValidators([Validators.required]);
          this.editForm.get('selectedAggregate').updateValueAndValidity();
        } else if (pagetemplate === 'file-upload-widget') {
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
                  pagetemplate === 'table-widget' ||
                  pagetemplate === 'form-widget' ||
                  pagetemplate === 'form-wizard-widget' ||
                  pagetemplate === 'file-upload-widget'
                ) {
                  this.editForm.get('resourcePath').setValidators([Validators.required]);
                  this.editForm.get('resourcePath').updateValueAndValidity();
                }
                if (pagetemplate === 'aio-table' || pagetemplate === 'aio-grid' || pagetemplate === 'dashboard-widget') {
                  this.editForm.get('resourcePath').clearValidators();
                  this.editForm.get('resourcePath').updateValueAndValidity();
                }
                if (pagetemplate === 'file-upload-widget' || pagetemplate === 'dashboard-widget') {
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
    protected builtInWidgetService: BuiltInWidgetService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    protected projectService: ProjectService,
    protected widgetService: BuiltInWidgetService,
    protected microserviceService: MicroserviceInstallerService,
    private router: Router,
    protected pageConfigService: PageConfigService,
    protected eventManager: EventManagerService,
    protected aggregateService: AggregateService
  ) {}

  ngOnInit() {
    this.formDisable = true;
    this.buildNewForm();
    this.datamodels = [];
    this.widgetTemplateItems = [];
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
    this.subscribeToModelCreation();
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
                // this.loadMicroservices();
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
      this.pageId = params.pageId;
      this.widgetId = params.widgetId;
      // this.toolbarTrackerService.setWidgetID(this.widgetId);
      this.loadUpdateForm();
    });
    this.loadPageConfigsByPageId(this.pageId, this.projectUid);
  }

  addRow() {
    const paramType = this.editForm.get(['paramType']).value;
    const paramName = this.editForm.get(['paramName']).value;
    const paramDataType = this.editForm.get(['paramDataType']).value;

    if (paramType === null || paramName === '' || paramName === null || paramDataType === null) {
      // this.messageService.add({
      //   severity: 'warn',
      //   summary: 'Warn',
      //   detail: 'Please fill all the fields',
      // });
    } else {
      const param: APIInput = {
        paramType,
        inputType: paramDataType,
        inputName: paramName,
      };

      this.apiParams.push(param);
    }
  }

  deleteRow(param) {
    const index = this.apiParams.indexOf(param);
    this.apiParams.splice(index, 1);
  }

  addParamMapping() {
    const inputType = this.editForm.get(['inputValType']).value;
    const paramName = this.editForm.get(['matchedProperty']).value;

    if (inputType === null || paramName === '' || paramName === null) {
      // this.messageService.add({
      //   severity: 'warn',
      //   summary: 'Warn',
      //   detail: 'Please fill all the fields',
      // });
    } else {
      const param = {
        inputType,
        paramName,
      };
      if (this.loginParams.indexOf(param) === -1) {
        this.loginParams.push(param);
      }
    }
  }

  deleteParamMapping(param) {
    const index = this.loginParams.indexOf(param);
    this.loginParams.splice(index, 1);
  }

  addAIOTableRow() {
    const apiOperation = this.editForm.get(['apiOperation']).value;
    const apiResourcePath = this.editForm.get(['apiResourcePath']).value;

    if (apiOperation === null || apiResourcePath === null || apiResourcePath === '') {
      // this.messageService.add({
      //   severity: 'warn',
      //   summary: 'Warn',
      //   detail: 'Please fill all the fields',
      // });
    } else {
      const resource = {
        apiOperation,
        apiResourcePath,
      };

      this.apiResourceDetails.push(resource);
    }
  }

  onChangePageModel(event, edit) {
    if (event) {
      this.modelPropertyList = [];
      let currentDatamodel: IAggregate;
      currentDatamodel = edit ? event : event.value;
      let currentDatamodeProperties: IProperty[];
      currentDatamodeProperties = edit ? event.config.children : event.value.config.children;
      for (let i = 0; i < currentDatamodeProperties.length; i++) {
        if (currentDatamodeProperties[i].data.type === 'property') {
          const dropdownLabel = currentDatamodeProperties[i].label;
          this.modelPropertyList.push({ label: dropdownLabel, value: dropdownLabel });
        }
      }
      this.notifyModelChange(currentDatamodel);
    }
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

  deleteaddAIOTableRow(apiDetail) {
    const index = this.apiResourceDetails.indexOf(apiDetail);
    this.apiResourceDetails.splice(index, 1);
  }

  addPanelRow() {
    const panelType = this.editForm.get(['panelType']).value;
    const panelName = this.editForm.get(['panelName']).value;
    const panelID = this.editForm.get(['panelID']).value;
    const dashboardUID = this.editForm.get(['dashboardUID']).value;
    const dashboardTitle = this.editForm.get(['dashboardTitle']).value;

    if (panelType === null || panelName === '' || !panelID || !dashboardUID || !dashboardTitle) {
      // this.messageService.add({
      //   severity: 'warn',
      //   summary: 'Warn',
      //   detail: 'Please fill all the fields',
      // });
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

  loadAggregates() {
    for (let i = 0; i < this.aggregates.length; i++) {
      if (this.aggregates[i].status === 'ENABLED') {
        const dropdownLabel = this.aggregates[i].name;
        this.aggregateItems.push({ label: dropdownLabel, value: this.aggregates[i] });
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

  loadUpdateForm() {
    this.widgetService
      .find(this.projectUid, this.widgetId)
      .pipe(
        filter((mayBeOk: HttpResponse<IProject>) => mayBeOk.ok),
        map((response: HttpResponse<IProject>) => response.body)
      )
      .subscribe(
        (res: IWidget) => {
          this.currentWidget = res;
          this.updateForm(res);
        },
        (error: HttpErrorResponse) => this.onError(error.message)
      );
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

      this.editForm.get('resourcePath').patchValue(suggestedPath, { emitEvent: true });
    }
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

  onChangeMicroservice() {
    this.apiItems = [];
    const microservice = this.editForm.get(['microservice']).value;
    this.microserviceService
      .findApis(microservice.uuid, this.projectUid)
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

  loadMicroserviceDropdownItems() {
    for (let i = 0; i < this.microservices.length; i++) {
      if (this.microservices[i].status === 'ENABLED') {
        const dropdownLabel = this.microservices[i].name;
        this.microserviceItems.push({ label: dropdownLabel, value: this.microservices[i] });
      }
    }
  }

  loadMicroserviceProjectDropdownItems() {
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

  updateForm(widgetData: IWidget) {
    if (widgetData.model && widgetData.model.config) {
      this.onChangePageModel(widgetData.model, true);
    }
    if (this.project.apptypesID === 'task.ui') {
      if (widgetData.widgettemplate === 'register-widget') {
        this.widgetTemplateItems.push({ label: 'Register Page', value: 'register-widget' });
      } else if (widgetData.widgettemplate === 'login-widget') {
        this.widgetTemplateItems.push({ label: 'Login Page', value: 'login-widget' });
        this.loginParams = widgetData.loginParams;
      }
      if (widgetData.widgettemplate !== 'aio-table' && widgetData.widgettemplate !== 'aio-grid' && widgetData.params) {
        this.apiParams = widgetData.params;
      }

      if (widgetData.widgettemplate === 'aio-table' || (widgetData.widgettemplate !== 'aio-grid' && widgetData.apiResourceDetails)) {
        this.apiResourceDetails = widgetData.apiResourceDetails;
      } else if (widgetData.widgettemplate === 'dashboard-widget' && widgetData.dashboardPanelDetails) {
        this.dashboardPanelDetails = widgetData.dashboardPanelDetails;
      }
      this.editForm.patchValue({
        id: widgetData.uuid,
        apiType: widgetData.apiType,
        selectedAggregate: widgetData.model,
        resourcePath: widgetData.resourcePath,
        //  operation: builtInPage.operation,
        pagetitle: widgetData.widgetTitle,
        pagetemplate: widgetData.widgettemplate,
        projectUuid: this.projectUid,
      });
      this.widgetTitle = widgetData.widgetTitle;
    }
  }

  getPageTemplates() {
    if (this.project.apptypesID === 'task.ui') {
      if (!this.isLoginPageExist) {
        //  this.widgetTemplateItems.push({ label: 'Login Page', value: 'login-widget' });
      }
      if (!this.isRegisterPageExist) {
        //   this.widgetTemplateItems.push({ label: 'Register Page', value: 'register-widget' });
      }
      this.widgetTemplateItems.push({ label: 'Table View', value: 'table-widget' });
      this.widgetTemplateItems.push({ label: 'Form View', value: 'form-widget' });
      // this.widgetTemplateItems.push({ label: 'Form Wizard View', value: 'form-wizard-widget' });
      // this.widgetTemplateItems.push({ label: 'Grid View', value: 'aio-grid' });
      // this.widgetTemplateItems.push({ label: 'All-in-One Table View', value: 'aio-table' });
      // this.widgetTemplateItems.push({ label: 'File Upload View', value: 'file-upload-widget' });
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

  save(widget: Widget) {
    // this.spinnerService.show();
    this.isSaving = true;
    if (widget.uuid) {
      this.subscribeToSaveResponse(this.builtInWidgetService.update(widget, this.projectUid));
    } else {
      this.subscribeToSaveResponse(this.builtInWidgetService.create(widget, this.projectUid));
    }
  }

  private createFromForm(): IWidget {
    if (this.project.apptypesID === 'task.ui') {
      if (this.editForm.get(['pagetemplate']).value === 'aio-table') {
        this.dashboardPanelDetails = [];
      } else if (this.editForm.get(['pagetemplate']).value === 'dashboard-widget') {
        this.apiResourceDetails = [];
        this.apiParams = [];
      }

      return {
        ...new Widget(),
        uuid: this.editForm.get(['id']).value,
        model: this.editForm.get(['selectedAggregate']).value,
        widgetTitle: this.editForm.get(['pagetitle']).value,
        widgettemplate: this.editForm.get(['pagetemplate']).value,
        widgettype: 'api-page',
        params: this.apiParams,
        loginParams: this.loginParams,
        apiResourceDetails: this.apiResourceDetails,
        dashboardPanelDetails: this.dashboardPanelDetails,
        //   operation: this.editForm.get(['operation']).value,
        resourcePath: this.editForm.get(['resourcePath']).value,
        status: 'ENABLED',
        projectUuid: this.projectUid,
      };
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPage>>) {
    result.subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    // this.spinnerService.hide();
    this.isSaving = false;
    this.widgetTitle = this.editForm.get(['pagetitle']).value;
    // this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form saved' });
    this.enableToEdit();
  }

  protected onSaveError() {
    // this.spinnerService.hide();
    this.isSaving = false;
    // this.messageService.add({ severity: 'error', summary: 'error', detail: 'Error' });
  }

  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }

  checkWidgetNameExist() {
    const widget = this.createFromForm();
    this.builtInWidgetService
      .findWidgetNameAvailability(widget.widgetTitle, widget.uuid, this.projectUid)
      .pipe(
        filter((res: HttpResponse<any>) => res.ok),
        map((res: HttpResponse<any>) => res.body)
      )
      .subscribe(
        (res: any) => {
          if (res.IsNameExist) {
            // this.messageService.add({
            //   severity: 'error',
            //   summary: 'Name exists!',
            //   detail: 'Entered widget name is already exist. please use another',
            // });
          } else {
            this.save(widget);
          }
        },
        (res: HttpErrorResponse) => this.onError(res.message)
      );
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

  trackDatamodelById(index: number, item: IDatamodel) {
    return item.uuid;
  }

  ngOnDestroy() {
    // this.toolbarTrackerService.setProjectUUID('');
    // this.toolbarTrackerService.setIsEntityPage('no');
    this.eventSubscriber.unsubscribe();
  }

  enableToEdit() {
    this.formDisable = !this.formDisable;
  }
  newSideBarVisible() {
    this.isSidebarVisible = true;
    this.isSelected = true;
    this.createStatus = 'new';
  }

  backSidebar($event) {
    this.isSidebarVisible = $event;
    this.closeSidebar();
  }

  backSidebarModel($event) {
    this.isSidebarVisible = $event;
    this.isSelected = false;
  }

  aggregate($event) {
    this.aggregateId = $event;
  }

  closeSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    if (this.isSidebarVisible) {
      this.sidebar = !this.sidebar;
    }
    this.isSelected = false;
  }

  subscribeToModelCreation() {
    this.eventSubscriber = this.eventManager.on(EventTypes.newViewModelCreation).subscribe(event => this.setModelToPage(event));
  }

  setModelToPage(event) {
    if (event && event.payload && event.payload.content) {
      this.aggregateService
        .find(event.payload.content, this.projectUid)
        .pipe(
          filter((response: HttpResponse<Aggregate>) => response.ok),
          map((aggregate: HttpResponse<Aggregate>) => aggregate.body)
        )
        .subscribe(
          (aggregate: IAggregate) => {
            const dropdownLabel = aggregate.name;
            this.aggregateItems.push({ label: dropdownLabel, value: aggregate });
            this.editForm.patchValue({
              selectedAggregate: aggregate,
            });
          },
          (res: HttpErrorResponse) => this.onError(res.message)
        );
    }
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
                this.aggregateItems = [];
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

  addFieldsToSteps() {
    const field = this.editForm.get(['fieldName']).value;
    let stepHeader = '';
    let stepId = 0;
    if (this.editForm.get(['stepHeader']).value) {
      // tslint:disable-next-line:radix
      stepId = parseInt(this.editForm.get(['stepHeader']).value.split('-')[0]);
      stepHeader = this.editForm.get(['stepHeader']).value.split('-')[1];
    }

    if (!field || !stepId) {
      // this.messageService.add({
      //   severity: 'warn',
      //   summary: 'Warn',
      //   detail: 'Please fill all the fields',
      // });
    } else {
      const stepField = {
        field,
        stepHeader,
        stepId,
      };
      if (this.stepFieldArr.indexOf(stepField) === -1) {
        this.stepFieldArr.push(stepField);
      }
    }
  }
  removeWizardDetailsGroup(index: number) {
    this.wizardDetailsGroup.removeAt(index);
    this.getAllWizardSteps();
  }
  getAllWizardSteps() {
    this.stepHeadersList = [];
    const allStepControllers = this.wizardDetailsGroup.controls;
    for (let i = 0; i < allStepControllers.length; i++) {
      // this.stepHeadersList.push({
      //   label: allStepControllers[i].controls.stepHeading.value,
      //   value: allStepControllers[i].controls.stepId.value + '-' + allStepControllers[i].controls.stepHeading.value,
      // });
    }
  }

  deleteFieldSteps(param) {
    const index = this.stepFieldArr.indexOf(param);
    this.stepFieldArr.splice(index, 1);
  }

  get wizardDetailsGroup() {
    return this.editForm.get('wizardDetailsGroup') as FormArray;
  }

  insertWizardDetailsGroup(stepH) {
    this.stepIndexId = this.wizardDetailsGroup.length + 1;
    // this.stepIndexId++;
    this.wizardDetailsGroup.push(this.addWizardDetailsGroup(stepH));
    this.getAllWizardSteps();
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
      // this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Value is required' });
    }
  }

  onRowEditCancel(car: Config, index: number) {
    this.pageConfigs[index] = this.clonedCars[car.property];
    delete this.clonedCars[car.property];
  }
}
