import {Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges, Inject} from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IProject } from '@app/shared/models/model/project.model';
import {IDatamodel} from '@shared/models/model/datamodel.model';
import {IPage, Page} from '@shared/models/model/page.model';
import { IAggregate } from '@app/shared/models/model/aggregate.model';
import {IInstalledMicroservice} from '@shared/models/model/installed-microservice.model';
import {APIInput} from '@shared/models/model/api-input.model';
import {Grid, IGrid, Row} from '@app/shared/models/model/grid.model';
import {ProjectService} from '@core/projectservices/project.service';
import {Widget} from '@shared/models/model/widget.model';
import {FormControllers, IFormControllers} from '@shared/models/model/form-controllers.model';
import {BuiltInPageService} from '@core/projectservices/built-in-page.service';
import {MicroserviceInstallerService} from '@core/projectservices/microservice-installer.service';
import {EventManagerService} from '@shared/events/event.type';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';

interface Item {
  value: any;
  label: string;
}
@Component({
  selector: 'virtuan-init-page-creation',
  templateUrl: './init-page-creation.component.html',
  styleUrls: ['./built-in-page.component.scss'],
})
export class InitPageCreationComponent implements OnInit, OnDestroy {
  // @Input('projectUid') projectUid: string;
  // @Input('rowData') rowData: any;
  // @Input('createStatus') createStatus: string;
  // @Input('isLoginPageExist') isLoginPageExist: string;
  // @Input('isRegisterPageExist') isRegisterPageExist: string;
  // @Input('isHomePageExist') isHomePageExist: string;
  // @Input('isVisible') isVisible: boolean;
  // @Output() isVisibleEvent = new EventEmitter<boolean>();
  isHomePageExist = 'false';
  @Input()
  modelUid: string;
  isSaving: boolean;
  // projectId: number;
  project: IProject;
  datamodels: IDatamodel[];
  pageTemplateItems: Item[];
  datamodelItems: Item[];
  currentPage: IPage;
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
  projectUid: string;
  loginParams: any[];
  stepFieldArr: any[] = [];
  isLoginPageExist: string;
  isRegisterPageExist: string;
  pageViewType = '';
  form: FormGroup;
  pageTemplateType = '';
  pageCreationStatus = 'typeSelection';
  gridStyle = '';
  gridArray: IGrid[] = [];
  isSidebarVisible = false;
  selectedRowIndex: number;
  selectedContainerIndex: number;
  rowValues = '';
  isSelected = false;
  widgetCreationStatus = 'widgetTypeSelection';
  totalPageCount: number;
  grid: IGrid;

  panelTypeItems: Item[] = [
    { label: 'Graph', value: 'graph' },
    { label: 'Gauge', value: 'gauge' },
    { label: 'Logs', value: 'logs' },
    { label: 'Stat', value: 'stat' },
    { label: 'Bar Gauge', value: 'bargauge' },
    { label: 'Table', value: 'table' },
  ];

  crudItems: Item[] = [
    { label: 'CREATE', value: 'CREATE' },
    { label: 'UPDATE', value: 'UPDATE' },
    { label: 'DELETE', value: 'DELETE' },
    { label: 'FIND', value: 'FIND' },
  ];
  loginInputs: Item[] = [
    { label: 'User Name', value: 'UNAME' },
    { label: 'Password', value: 'password' },
  ];
  paramitems: Item[] = [
    { label: 'Query', value: 'QUERY' },
    { label: 'Path', value: 'PATH' },
  ];
  paramDataTypeItems: Item[] = [
    { label: 'TEXT', value: 'TEXT' },
    { label: 'NUMBER', value: 'NUMBER' },
    { label: 'FLOAT', value: 'FLOAT' },
    { label: 'TRUE_OR_FALSE', value: 'TRUE_OR_FALSE' },
    { label: 'DATE', value: 'DATE' },
  ];
  stepHeadersList: Item[] = [];
  editForm: FormGroup;
  stepIndexId = 1;
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
      authority: '',
      aioapi: [],
      inputValType: [],
      matchedProperty: [],
      fieldName: [],
      stepHeader: [],
      showTable: false,
      isSecurePage: false,
      isHomepage: false,
      wizardDetailsGroup: this.fb.array([
        new FormGroup({
          stepHeading: this.fb.control('Step 1'),
          stepId: this.fb.control(this.stepIndexId),
        }),
      ]),
    });
  }

  constructor(
    protected builtInPageService: BuiltInPageService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    // protected toolbarTrackerService: ToolbarTrackerService,
    protected projectService: ProjectService,
    protected microserviceService: MicroserviceInstallerService,
    protected eventManager: EventManagerService,
    public dialogRef: MatDialogRef<InitPageCreationComponent>,
    @Inject(MAT_DIALOG_DATA)  public data: any,
    // private spinnerService: NgxSpinnerService,
  ) {}

  // ngOnInit() {
  //   this.getBuiltInPageData();
  // }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (this.isVisible) {
  //     this.getBuiltInPageData();
  //     this.pageCreationStatus = 'typeSelection';
  //     this.getGridArray();
  //   }
  // }
  getGridArray() {
    this.gridArray = [
      {
        name: 'grid1',
        rows: [
          { containers: [{ containerCols: 12, widget: new Widget() }] },
          { containers: [{ containerCols: 12, widget: new Widget() }] },
        ],
      },
      {
        name: 'grid2',
        rows: [
          {
            containers: [
              { containerCols: 6, widget: new Widget() },
              { containerCols: 6, widget: new Widget() },
            ],
          },
          { containers: [{ containerCols: 12, widget: new Widget() }] },
        ],
      },
      {
        name: 'grid3',
        rows: [
          {
            containers: [
              { containerCols: 9, widget: new Widget() },
              { containerCols: 3, widget: new Widget() },
            ],
          },
          { containers: [{ containerCols: 12, widget: new Widget() }] },
        ],
      },
    ];
  }

  ngOnInit() {
    this.buildNewForm();
    this.getGridArray();
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
    this.stepFieldArr = [];
    this.stepHeadersList = [];
    this.stepFieldArr = [];
    this.stepIndexId = 1;
    this.createCustomGridForm();
    this.projectUid = this.data.projectUid;
    // this.projectId = params['projId'];
    // this.toolbarTrackerService.setProjectUUID(this.projectUid);
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
            this.numOfPages();
            //  this.getPageTemplates();
            if (this.project.apptypesID === 'task.ui') {
              this.aggregates = this.project.aggregates;
              if (this.aggregates) {
              }
            } else {
              this.datamodels = this.project.datamodels;
            }

            // this.loadUpdateForm();
          },
          (res: HttpErrorResponse) => this.onError(res.message)
        );
    } else {
      //     if (this.createStatus == 'update') {
      //     }
    }
    //  if (this.createStatus == 'new') {
    this.pageViewType = '';
    this.gridStyle = '';
    //   }
  }

  onchangePageTemplate() {
    this.apiItems = [];
    this.panelItems = [];
  }

  numOfPages(){
    this.builtInPageService
        .findBuiltInPagesForProjectId(this.projectUid ,this.projectUid)
        .pipe(
            filter((res: HttpResponse<IPage[]>) => res.ok),
            map((res: HttpResponse<IPage[]>) => res.body)
        )
        .subscribe(
            (res: IPage[]) => {
              this.totalPageCount = res.length;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }

  save(pageViewType, pageTitle, pageTemplate) {
    // this.spinnerService.show();
    this.isSaving = true;
    const builtInPage = this.createFromForm(pageViewType, pageTitle, pageTemplate);
    if (builtInPage.uuid) {
      this.subscribeToSaveResponse(this.builtInPageService.update(builtInPage, this.projectUid));
    } else {
      this.subscribeToSaveResponse(this.builtInPageService.create(builtInPage, this.projectUid));
    }
  }

  private createFromForm(pageViewType: string, pageTitle: string, pageTemplate: string): IPage {
    let pageType = 'custom-page';
    if (this.project.apptypesID === 'task.ui') {
      if (this.editForm.get(['pagetemplate']).value === 'aio-table') {
        this.dashboardPanelDetails = [];
      } else if (this.editForm.get(['pagetemplate']).value === 'dashboard-page') {
        this.apiResourceDetails = [];
        this.apiParams = [];
      }

      if (this.pageViewType === 'singleWidget') {
        this.gridStyle = 'none';
        pageType = 'api-page';
      }
      const pageNumber = this.totalPageCount + 1;
      return {
        ...new Page(),
        uuid: this.editForm.get(['id']).value,
        projectUuid: this.projectUid,
        pagetitle: pageTitle + pageNumber,
        pageViewType,
        pageGrid: this.grid,
        pagetemplate: pageTemplate,
        pagetype: pageType,
        status: 'init',
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
    this.eventManager.dispatch(
        new AppEvent(EventTypes.editorUITreeListModification, {
          name: 'editorUITreeListModification',
          content: 'Add an Page',
        })
    );

    this.dialogRef.close();
  }

  protected onSaveError() {
    // this.spinnerService.hide();
    this.isSaving = false;
  }

  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }

  previousState() {}

  ngOnDestroy() {
    // this.toolbarTrackerService.setProjectUUID('');
    // this.toolbarTrackerService.setIsEntityPage('no');
  }

  pageTemplateTypeSelection(template: string) {
    if (template === 'blank') {
      this.pageCreationStatus = 'gridSelection';
      this.pageTemplateType = template;
    } else {
      this.pageTemplateType = template;
      this.createTemplatePage(template);
    }
  }

  createTemplatePage(template: string) {
    this.save('singleWidget', 'Template Page', template);
  }

  createCustomGrid() {
    this.pageCreationStatus = 'customGrid';
  }

  gridStyles(isCustom: boolean, ind: number) {
    this.pageViewType = 'multiWidget';
    this.pageCreationStatus = 'addWidgets';
    if (!isCustom) {
      this.gridStyle = this.gridArray[ind].name;
      this.grid = this.gridArray[ind];
    }
    this.save(this.pageViewType, 'untitled page', 'grid-page');
    //  this.editForm.reset();
    //   this.pageCreationStatus = 'basicDetails';
  }

  pageCreateViewHandler(action) {
    if (this.pageViewType === 'singleWidget' && action === 'back') {
      if (this.pageCreationStatus === 'basicDetails') {
        this.pageCreationStatus = 'typeSelection';
      }
    } else if (this.pageViewType === 'multiWidget' && action === 'back') {
      if (this.pageCreationStatus === 'basicDetails') {
        this.pageCreationStatus = 'typeSelection';
      } else if (this.pageCreationStatus === 'gridSelection') {
        this.pageCreationStatus = 'basicDetails';
      } else if (this.pageCreationStatus === 'addWidgets') {
        this.pageCreationStatus = 'gridSelection';
      }
    } else if (this.pageViewType === 'multiWidget' && action === 'next') {
      if (this.pageCreationStatus === 'basicDetails') {
        this.pageCreationStatus = 'gridSelection';
      }
    }
  }

  selectWidgetType(rawIndex, containerIndex) {
    this.isSidebarVisible = true;
    this.isSelected = true;
    this.selectedRowIndex = rawIndex;
    this.selectedContainerIndex = containerIndex;
  }

  setWidgetType(widgetTemplate) {
    this.grid.rows[this.selectedRowIndex].containers[this.selectedContainerIndex].widget.widgettemplate = widgetTemplate;
    this.widgetCreationStatus = 'addWidgetDetails';
  }

  backSidebar($event) {
    this.isSidebarVisible = $event;
  }

  getRow(columns) {
    const row = new Row();

    switch (columns) {
      case 1:
        row.containers = [{ containerCols: 12, widget: new Widget() }];
        return row;
      case 2:
        row.containers = [
          { containerCols: 6, widget: new Widget() },
          { containerCols: 6, widget: new Widget() },
        ];
        return row;
      case 3:
        row.containers = [
          { containerCols: 4, widget: new Widget() },
          { containerCols: 4, widget: new Widget() },
          { containerCols: 4, widget: new Widget() },
        ];
        return row;
      case 4:
        row.containers = [
          { containerCols: 3, widget: new Widget() },
          { containerCols: 3, widget: new Widget() },
          { containerCols: 3, widget: new Widget() },
          { containerCols: 3, widget: new Widget() },
        ];
        return row;
      default:
        row.containers = [{ containerCols: 12, widget: new Widget() }];
        return row;
    }
  }

  //// ---- custom Grid ---- ////

  createCustomGridForm() {
    this.form = this.fb.group({
      formFieldsGroup: this.fb.array([
        new FormGroup({
          columns: new FormControl(1),
        }),
      ]),
    });
  }

  addWidget(widget: any) {
  }

  insertFormControllersGroup() {
    this.formFieldsGroup.push(this.addFormFieldsGroup());
  }

  addFormFieldsGroup(): FormGroup {
    return new FormGroup({
      columns: new FormControl(1),
    });
  }

  saveCustomGrid() {
    // this.spinnerService.show();
    this.isSaving = true;
    const formData = this.createCustomGridFromForm();
    if (formData && formData.fieldList && formData.fieldList.length > 0) {
      const customGrid = new Grid();
      const rowArray = [];
      for (let i = 0; i < formData.fieldList.length; i++) {
        const row = this.getRow(formData.fieldList[i].columns);
        rowArray.push(row);
      }
      customGrid.name = 'custom';
      customGrid.rows = rowArray;
      this.grid = customGrid;
      this.gridStyles(true, -1);
    }
  }

  private createCustomGridFromForm(): IFormControllers {
    return {
      ...new FormControllers(),
      fieldList: this.formFieldsGroup.value,
    };
  }

  get formFieldsGroup() {
    return this.form.get('formFieldsGroup') as FormArray;
  }

  removeFormControllers(index: number) {
    this.formFieldsGroup.removeAt(index);
  }

  ////////////

  showModelCreation($event) {
    // this.widgetCreationStatus === 'addNewModel';
  }

  clear() {
    // this.activeModal.dismiss('cancel');
  }
}

export interface IPageApi {
  apiType?: string;
  api?: any;
}

export interface IDashboardPanel {
  dashboardUID?: string;
  dashboardTitle?: string;
  panelName?: string;
  panelType?: string;
  panelID?: string;
  panel?: any;
}