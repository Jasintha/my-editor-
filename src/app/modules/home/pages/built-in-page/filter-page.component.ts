import {Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges} from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IProject } from '@app/shared/models/model/project.model';
import {IDatamodel} from '@shared/models/model/datamodel.model';
import {SelectItem} from 'primeng/api';
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

@Component({
    selector: 'virtuan-filter-page',
    templateUrl: './filter-page.component.html',
    styleUrls: ['./built-in-page.component.scss'],
})
export class FilterPageComponent implements OnDestroy , OnChanges{
    @Input() projectUid: string;
    @Input() pageId: string;
    isSaving: boolean;
    projectId: number;
    project: IProject;
    datamodels: IDatamodel[];
    datamodelItems: SelectItem[];
    currentPage: IPage;
    filterFormPage: IPage;
    microservices: IInstalledMicroservice[];
    microserviceProjects: IProject[];
    dashboardProjects: IProject[];
    microserviceItems: SelectItem[];
    microserviceProjectItems: SelectItem[];
    dashboardProjectItems: SelectItem[];
    modelPropertyListFilterForm: SelectItem[];
    modelPropertyListFilterTable: SelectItem[];
    apiItems: SelectItem[];
    panelItems: SelectItem[];
    aggregates: IAggregate[];
    aggregateItems: SelectItem[];
    apiParams: APIInput[];
    apiResourceDetails: any[];
    dashboardPanelDetails: any[];
    // projectUid: string;
    loginParams: any[];
    isLoginPageExist: string;
    isRegisterPageExist: string;
    pageTitle: string;
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
    stepHeadersList: SelectItem[] = [];
    detailsHeadersList: SelectItem[] = [];
    stepIndexId = 1;
    headerIndexId = 1;

    displayedStepHeaderColumns: string[] = ['field', 'stepheader', 'actions'];
    ELEMENT_DATA = [];
    dataSourceWizard = new MatTableDataSource(this.ELEMENT_DATA);

    displayedDetailHeaderColumns: string[] = ['field', 'detailsHeader', 'actions'];
    DETAILS_DATA = [];
    dataSourceDetailsPage = new MatTableDataSource(this.DETAILS_DATA);

    displayedLoginParamColumns: string[] = ['input', 'param', 'actions'];
    LOGIN_DATA = [];
    dataSourceLogin = new MatTableDataSource(this.LOGIN_DATA);

    displayedAioParamColumns: string[] = ['operation', 'path', 'actions'];
    PARAM_DATA = [];
    dataSourceAIOParam = new MatTableDataSource(this.PARAM_DATA);

    attachedPageLocationValues: SelectItem[] = [
        { label: 'Top', value: 'Top' },
        { label: 'Right', value: 'Right' },
        { label: 'Bottom', value: 'Bottom' },
        { label: 'Left', value: 'Left' },
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
    filterTableData: FormGroup;
    filterFormData: FormGroup;
    formDisable: boolean;
    buildNewForm() {
        this.filterTableData = this.fb.group({
            id: [],
            selectedDatamodel: [],
            pagetitle: ['', [Validators.required]],
            pagetemplate: ['', [Validators.required]],
            apiOperation: [],
            apiResourcePath: [],
            isSecurePage: false,
            authority: '',
            attachedPageLocation: '',
            isHomepage: false,
            resourcePath: [],
            selectedAggregateTable: [],
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
            fieldName: [],
            stepHeader:[],
            detailHeader:[],
            attributeName:[],
        });
    }

    buildNewFilterForm() {
        this.filterFormData = this.fb.group({
            id: [],
            selectedDatamodel: [],
            pagetitle: ['', [Validators.required]],
            pagetemplate: ['', [Validators.required]],
            apiOperation: [],
            apiResourcePath: [],
            isSecurePage: false,
            authority: '',
            isHomepage: false,
            formResourcePath: [],
            selectedAggregateForm: [],
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
            fieldName: [],
            stepHeader:[],
            detailHeader:[],
            attributeName:[],
        });
    }

    setCategoryModelValidators() {
        const apptype = this.project.apptypesID;

        this.filterTableData.get('pagetemplate').valueChanges.subscribe(pagetemplate => {
            if (apptype === 'task.ui') {
                this.filterFormData.get('formResourcePath').setValidators([Validators.required]);
                this.filterFormData.get('formResourcePath').updateValueAndValidity();
                this.filterTableData.get('resourcePath').setValidators([Validators.required]);
                this.filterTableData.get('resourcePath').updateValueAndValidity();
                this.filterFormData.get('selectedAggregateForm').setValidators([Validators.required]);
                this.filterFormData.get('selectedAggregateForm').updateValueAndValidity();
                this.filterTableData.get('selectedAggregateTable').setValidators([Validators.required]);
                this.filterTableData.get('selectedAggregateTable').updateValueAndValidity();
            }
        });
    }

    setCategoryModelValidatorsTest() {
        this.activatedRoute.params.subscribe(params => {
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
                            this.filterTableData.get('pagetemplate').valueChanges.subscribe(pagetemplate => {
                                    this.filterTableData.get('resourcePath').setValidators([Validators.required]);
                                    this.filterTableData.get('resourcePath').updateValueAndValidity();
                                    this.filterTableData.get('selectedAggregateTable').clearValidators();
                                    this.filterTableData.get('selectedAggregateTable').updateValueAndValidity();
                                    this.filterTableData.get('selectedAggregateTable').clearValidators();
                                    this.filterTableData.get('selectedAggregateTable').updateValueAndValidity();
                            });
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
        private consoleLogService: ConsoleLogService
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        this.loadPage()
    }

    // ngOnInit() {
    //   this.loadPage();
    // }

    loadPage(){
        this.formDisable = true;
        this.buildNewForm();
        this.buildNewFilterForm();
        this.datamodels = [];
        this.datamodelItems = [];
        this.isSaving = false;
        this.microserviceItems = [];
        this.modelPropertyListFilterTable = [];
        this.modelPropertyListFilterForm = [];
        this.loginParams = [];
        this.microserviceProjectItems = [];
        this.dashboardProjectItems = [];
        this.apiItems = [];
        this.panelItems = [];
        this.aggregateItems = [];
        this.apiParams = [];
        this.apiResourceDetails = [];
        this.dashboardPanelDetails = [];
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
            // this.pageId = params.pageId;
        });
        this.loadPageConfigsByPageId(this.pageId, this.projectUid);
    }

    addRow() {
        const paramType = this.filterTableData.get(['paramType']).value;
        const paramName = this.filterTableData.get(['paramName']).value;
        const paramDataType = this.filterTableData.get(['paramDataType']).value;

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
        const inputType = this.filterTableData.get(['inputValType']).value;
        const paramName = this.filterTableData.get(['matchedProperty']).value;

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
                this.LOGIN_DATA.push(param);
                this.dataSourceLogin = new MatTableDataSource(this.LOGIN_DATA);
            }
        }
    }

    deleteParamMapping(param) {
        const indexnum = this.LOGIN_DATA.indexOf(param);
        this.LOGIN_DATA.splice(indexnum, 1);
        this.dataSourceLogin = new MatTableDataSource(this.LOGIN_DATA);

        const index = this.loginParams.indexOf(param);
        this.loginParams.splice(index, 1);
    }

    addAIOTableRow() {
        const apiOperation = this.filterTableData.get(['apiOperation']).value;
        const apiResourcePath = this.filterTableData.get(['apiResourcePath']).value;

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
            this.PARAM_DATA.push(resource);
            this.dataSourceAIOParam = new MatTableDataSource(this.PARAM_DATA);
        }
    }

    onChangeFilterFormModel(event, edit) {
        if (event) {
            this.modelPropertyListFilterForm = [];
            let currentDatamodel: IAggregate;
            currentDatamodel = edit ? event : event.value;
            let currentDatamodeProperties: IProperty[];
            currentDatamodeProperties = edit ? event.config.children : event.value.config.children;
            for (let i = 0; i < currentDatamodeProperties.length; i++) {
                if (currentDatamodeProperties[i].data.type === 'property') {
                    const dropdownLabel = currentDatamodeProperties[i].label;
                    this.modelPropertyListFilterForm.push({ label: dropdownLabel, value: dropdownLabel });
                }
            }
            this.notifyFormModelChange(currentDatamodel);
        }
    }

    onChangeFilterTableModel(event, edit) {
        if (event) {
            this.modelPropertyListFilterTable = [];
            let currentDatamodel: IAggregate;
            currentDatamodel = edit ? event : event.value;
            let currentDatamodeProperties: IProperty[];
            currentDatamodeProperties = edit ? event.config.children : event.value.config.children;
            for (let i = 0; i < currentDatamodeProperties.length; i++) {
                if (currentDatamodeProperties[i].data.type === 'property') {
                    const dropdownLabel = currentDatamodeProperties[i].label;
                    this.modelPropertyListFilterTable.push({ label: dropdownLabel, value: dropdownLabel });
                }
            }
            this.notifyTableModelChange(currentDatamodel);
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
        const indexnum = this.PARAM_DATA.indexOf(apiDetail);
        this.PARAM_DATA.splice(indexnum, 1);
        this.dataSourceAIOParam = new MatTableDataSource(this.PARAM_DATA);

        const index = this.apiResourceDetails.indexOf(apiDetail);
        this.apiResourceDetails.splice(index, 1);
    }

    addPanelRow() {
        const panelType = this.filterTableData.get(['panelType']).value;
        const panelName = this.filterTableData.get(['panelName']).value;
        const panelID = this.filterTableData.get(['panelID']).value;
        const dashboardUID = this.filterTableData.get(['dashboardUID']).value;
        const dashboardTitle = this.filterTableData.get(['dashboardTitle']).value;

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

    loadAggregates(selectedAggregate? : IAggregate, isFilterForm?:  boolean) {
        let selectedAggr;
        for (let i = 0; i < this.aggregates.length; i++) {
            if (this.aggregates[i].status === 'ENABLED') {
                const dropdownLabel = this.aggregates[i].name;
                this.aggregateItems.push({ label: dropdownLabel, value: this.aggregates[i] });
            }
            if (selectedAggregate && selectedAggregate.uuid === this.aggregates[i].uuid) {
                selectedAggr = this.aggregates[i];
            }
            if (selectedAggr) {
                if(isFilterForm) {
                    this.filterFormData.patchValue({
                        selectedAggregateForm: selectedAggr,
                    });
                }  else {
                    this.filterTableData.patchValue({
                        selectedAggregateTable: selectedAggr,
                    });
                }

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
        this.builtInPageService
            .find(this.pageId ,this.projectUid)
            .pipe(
                filter((mayBeOk: HttpResponse<IPage>) => mayBeOk.ok),
                map((response: HttpResponse<IPage>) => response.body)
            )
            .subscribe(
                (res: IPage) => {
                    this.currentPage = res;
                    this.updateFilterTabledata(res);
                    if(this.currentPage.attachedPage) {
                        this.loadFilterFormPage(this.currentPage.attachedPage);
                    }
                }
            );
        // this.activatedRoute.data.subscribe(({ builtInPage }) => {
        //   this.currentPage = builtInPage;
        //   this.updateForm(builtInPage);
        // });
    }

    onChangeMicroserviceAPI() {
        const microservice = this.filterTableData.get(['microservice']).value;
        const api = this.filterTableData.get(['api']).value;
        if (api && api.api) {
            const apiStart: boolean = api.api.resourcePath.startsWith('/');
            let suggestedPath = '';
            if (apiStart) {
                suggestedPath = '/' + microservice.name + '/api' + api.api.resourcePath;
            } else {
                suggestedPath = '/' + microservice.name + '/api/' + api.api.resourcePath;
            }

            this.filterTableData.get('resourcePath').patchValue(suggestedPath, { emitEvent: true });
        }
    }

    onChangeAioTableMicroserviceAPI() {
        const microservice = this.filterTableData.get(['aiomicroservice']).value;
        const api = this.filterTableData.get(['aioapi']).value;
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
                    this.filterTableData.get('apiOperation').patchValue(op, { emitEvent: true });
                }
            }
            this.filterTableData.get('apiResourcePath').patchValue(suggestedPath, { emitEvent: true });
        }
    }

    loadFilterFormPage(filterPageUUID: any) {
        this.builtInPageService
            .find(filterPageUUID ,this.projectUid)
            .pipe(
                filter((mayBeOk: HttpResponse<IPage>) => mayBeOk.ok),
                map((response: HttpResponse<IPage>) => response.body)
            )
            .subscribe(
                (res: IPage) => {
                    this.filterFormPage = res;
                    this.updateFilterFormdata(res)
                }
            );
    }

    onchangePageTemplate() {
        this.apiItems = [];
        this.panelItems = [];
    }

    onChangeMicroserviceProject() {
        this.apiItems = [];
        const microservice = this.filterTableData.get(['microservice']).value;
        this.filterTableData.get('resourcePath').patchValue('', { emitEvent: true });
        this.filterTableData.get('api').patchValue([], { emitEvent: true });

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
        const microservice = this.filterTableData.get(['aiomicroservice']).value;
        this.filterTableData.get('apiResourcePath').patchValue('', { emitEvent: true });
        this.filterTableData.get('apiOperation').patchValue('', { emitEvent: true });
        this.filterTableData.get('aioapi').patchValue([], { emitEvent: true });

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
        const microservice = this.filterTableData.get(['microservice']).value;
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

    notifyFormModelChange(currentDatamodel: IAggregate) {
        const selectedModel: IAggregate = this.filterFormData.get(['selectedAggregateForm']).value;
        this.eventManager.dispatch(
            new AppEvent(EventTypes.newViewModelCreation, {
                name: 'newViewModelCreation',
                content: currentDatamodel.uuid,
            })
        );
    }

    notifyTableModelChange(currentDatamodel: IAggregate) {
        const selectedModel: IAggregate = this.filterTableData.get(['selectedAggregateTable']).value;
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

    updateFilterTabledata(builtInPage: IPage) {
        if (builtInPage.model && builtInPage.model.config) {
            this.onChangeFilterFormModel(builtInPage.model, true);
        }
        if (builtInPage.authority) {
            this.filterTableData.patchValue({
                attachedPageLocation: true,
            });
        }
        if (this.project.apptypesID === 'task.ui') {
            if (builtInPage.pagetemplate !== 'aio-table' && builtInPage.pagetemplate !== 'aio-grid' && builtInPage.params) {
                if (builtInPage.params) {
                    this.apiParams = builtInPage.params;
                }
            }

            if (builtInPage.pagetemplate === 'aio-table' || (builtInPage.pagetemplate !== 'aio-grid' && builtInPage.apiResourceDetails)) {
                if (builtInPage.apiResourceDetails) {
                    this.apiResourceDetails = builtInPage.apiResourceDetails;
                }
            } else if (builtInPage.pagetemplate === 'dashboard-page' && builtInPage.dashboardPanelDetails) {
                this.dashboardPanelDetails = builtInPage.dashboardPanelDetails;
            }
            this.filterTableData.patchValue({
                id: builtInPage.uuid,
                apiType: builtInPage.apiType,
                selectedAggregateTable: builtInPage.model,
                resourcePath: builtInPage.resourcePath,
                //  operation: builtInPage.operation,
                pagetitle: builtInPage.pagetitle,
                pagetemplate: builtInPage.pagetemplate,
                authority: builtInPage.authority,
                projectUuid: this.projectUid,
                isHomepage: builtInPage.isHomepage,
            });
            this.pageTitle = builtInPage.pagetitle;
        }
        this.pagestyle = builtInPage.pagestyle;
        if(builtInPage.attachedPageLocation) {
            this.filterTableData.patchValue({
                attachedPageLocation: builtInPage.attachedPageLocation,
            });
        }
        this.loadAggregates(builtInPage.model, false)
    }

    updateFilterFormdata(builtInPage: IPage) {
        if (this.project.apptypesID === 'task.ui') {
            this.filterFormData.patchValue({
                id: builtInPage.uuid,
                apiType: builtInPage.apiType,
                selectedAggregateForm: builtInPage.model,
                formResourcePath: builtInPage.resourcePath,
                pagetemplate: builtInPage.pagetemplate,
                authority: builtInPage.authority,
                projectUuid: this.projectUid,
                isHomepage: builtInPage.isHomepage,
            });
        }
        this.loadAggregates(builtInPage.model, true)
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

    private getFilterTablePage(): IPage {
        let headersArray = [];
        let fieldMappingArray = [];
        if (this.project.apptypesID === 'task.ui') {
            return {
                ...new Page(),
                uuid: this.pageId,
                model: this.filterTableData.get(['selectedAggregateTable']).value,
                pagetitle: this.pageTitle,
                pagetemplate: 'filter-page',
                pagetype: 'filter-page',
                params: this.apiParams,
                loginParams: this.loginParams,
                apiResourceDetails: this.apiResourceDetails,
                dashboardPanelDetails: this.dashboardPanelDetails,
                resourcePath: this.filterTableData.get(['resourcePath']).value,
                status: 'ENABLED',
                projectUuid: this.projectUid,
                pagestyle: this.pagestyle,
                pageViewType: 'filterPage',
                authority: this.filterTableData.get(['authority']).value,
                isHomepage: this.filterTableData.get(['isHomepage']).value,
                attachedPage: this.filterFormPage.uuid,
                attachedPageLocation: this.filterTableData.get(['attachedPageLocation']).value,
            };
        }
    }

    private getFilterFormPage(): IPage {
        let headersArray = [];
        let fieldMappingArray = [];
        if (this.project.apptypesID === 'task.ui') {
            return {
                ...new Page(),
                uuid: this.filterFormPage.uuid,
                model: this.filterFormData.get(['selectedAggregateForm']).value,
                pagetitle: 'filter-form_ '+this.pageTitle,
                pagetemplate: 'filter-form',
                pagetype: 'filter-form',
                params: this.apiParams,
                loginParams: this.loginParams,
                apiResourceDetails: this.apiResourceDetails,
                resourcePath: this.filterFormData.get(['formResourcePath']).value,
                status: 'ENABLED',
                projectUuid: this.projectUid,
                pagestyle: this.pagestyle,
                pageViewType: 'filterForm',
                authority: this.filterFormData.get(['authority']).value,
                isHomepage: this.filterFormData.get(['isHomepage']).value,
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
        this.isSaving = false;
        if (this.filterTableData.get(['pagetitle']).value !== this.currentPage.pagetitle){
            this.eventManager.dispatch(
                new AppEvent(EventTypes.editorUITreeListModification, {
                    name: 'editorUITreeListModification',
                    content: 'Deleted an built in page',
                })
            );
        }
        this.pageTitle = this.filterTableData.get(['pagetitle']).value;
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

    trackDatamodelById(index: number, item: IDatamodel) {
        return item.uuid;
    }

    ngOnDestroy() {
        // this.eventSubscriber.unsubscribe();
        // this.toolbarTrackerService.setProjectUUID('');
        // this.toolbarTrackerService.setIsEntityPage('no');
        // this.toolbarTrackerService.setIsPageLayout('no');
    }

    enableToEdit() {
        this.formDisable = !this.formDisable;
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
        const filterTablePage = this.getFilterTablePage();
        const filterFormPage = this.getFilterFormPage();
        this.builtInPageService
            .findPageNameAvailability(this.pageTitle, this.currentPage.uuid, this.projectUid)
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
                        this.save(filterTablePage);
                        this.save(filterFormPage);
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

    createMainMenu(){
        const dialogRef = this.dialog.open(MainMenuComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.projectUid,
                createStatus: status,
                uuid: this.currentPage.uuid,
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

    createPageNavigation(){
        const dialogRef = this.dialog.open(PageNavigationComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.projectUid,
                createStatus: status,
                uuid: this.currentPage.uuid,
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }
}
