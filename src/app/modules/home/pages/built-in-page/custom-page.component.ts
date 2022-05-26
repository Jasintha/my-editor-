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
import {CreateApiComponent} from '@home/pages/create-api/create-api.component';
import {CustomPageApiDialogComponent} from '@home/pages/built-in-page/custom-page-api-dialog.component';

@Component({
    selector: 'virtuan-custom-page-view',
    templateUrl: './custom-page.component.html',
    styleUrls: ['./built-in-page.component.scss'],
})
export class CustomPageViewComponent implements OnDestroy , OnChanges{
    @Input() projectUid: string;
    @Input() pageId: string;
    isSaving: boolean;
    projectId: number;
    project: IProject;
    datamodels: IDatamodel[];
    pageTemplateItems: SelectItem[];
    datamodelItems: SelectItem[];
    currentPage: IPage;
    microservices: IInstalledMicroservice[];
    microserviceProjects: IProject[];
    dashboardProjects: IProject[];
    microserviceItems: SelectItem[];
    microserviceProjectItems: SelectItem[];
    dashboardProjectItems: SelectItem[];
    modelPropertyList: SelectItem[];
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
    stepHeadersList: SelectItem[] = [];
    stepIndexId = 1;

    displayedStepHeaderColumns: string[] = ['field', 'stepheader', 'actions'];
    ELEMENT_DATA = [];
    dataSourceWizard = new MatTableDataSource(this.ELEMENT_DATA);

    displayedLoginParamColumns: string[] = ['input', 'param', 'actions'];
    LOGIN_DATA = [];
    dataSourceLogin = new MatTableDataSource(this.LOGIN_DATA);

    displayedAioParamColumns: string[] = ['operation', 'path', 'actions'];
    PARAM_DATA = [];
    dataSourceAIOParam = new MatTableDataSource(this.PARAM_DATA);

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
            isSecurePage: false,
            authority: '',
            isHomepage: false,
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
            fieldName: [],
            stepHeader:[],
            wizardDetailsGroup: this.fb.array([
                new FormGroup({
                    stepHeading: this.fb.control('Step 1'),
                    stepId: this.fb.control(this.stepIndexId),
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
                                if (pagetemplate === 'file-upload-page' || pagetemplate === 'dashboard-page') {
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
            // this.pageId = params.pageId;
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
        const api = this.editForm.get(['aioapi']).value;
        const apiOperation = this.editForm.get(['apiOperation']).value;
        const apiResourcePath = this.editForm.get(['apiResourcePath']).value;

        this.updateApiTable(api, apiOperation, apiResourcePath)
    }

    updateApiTable(apiObj, apiOperation, apiResourcePath) {
        if (apiOperation === null || !apiResourcePath) {

        } else {
            const resource = {
                apiOperation,
                apiResourcePath,
            };

            this.apiResourceDetails.push(apiObj);
            this.PARAM_DATA.push(resource);
            this.dataSourceAIOParam = new MatTableDataSource(this.PARAM_DATA);
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
        this.builtInPageService
            .find(this.pageId ,this.projectUid)
            .pipe(
                filter((mayBeOk: HttpResponse<IPage>) => mayBeOk.ok),
                map((response: HttpResponse<IPage>) => response.body)
            )
            .subscribe(
                (res: IPage) => {
                    this.currentPage = res;
                    this.updateForm(res);
                }
            );
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
        if (builtInPage.model && builtInPage.model.config) {
            this.onChangePageModel(builtInPage.model, true);
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
                }
            }
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
            this.editForm.patchValue({
                id: builtInPage.uuid,
                apiType: builtInPage.apiType,
                selectedAggregate: builtInPage.model,
                resourcePath: builtInPage.resourcePath,
                //  operation: builtInPage.operation,
                pagetitle: builtInPage.pagetitle,
                pagetemplate: builtInPage.pagetemplate,
                authority: builtInPage.authority,
                projectUuid: this.projectUid,
                isHomepage: builtInPage.isHomepage,
            });
            if (builtInPage && builtInPage.stepHeaders && builtInPage.stepHeaders.length > 0) {
                this.wizardDetailsGroup.removeAt(0);
                for (const steph of builtInPage.stepHeaders) {
                    this.insertWizardDetailsGroup(steph.stepHeader);
                }
            }
            if (builtInPage && builtInPage.stepMappings && builtInPage.stepMappings.length > 0) {
                this.stepFieldArr = builtInPage.stepMappings;
            }
            this.pageTitle = builtInPage.pagetitle;
        }
        this.pagestyle = builtInPage.pagestyle;
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

    private createFromForm(): IPage {
        if (this.project.apptypesID === 'task.ui') {
            if (this.editForm.get(['pagetemplate']).value === 'aio-table') {
                this.dashboardPanelDetails = [];
            } else if (this.editForm.get(['pagetemplate']).value === 'dashboard-page') {
                this.apiResourceDetails = [];
                this.apiParams = [];
            }

            return {
                ...new Page(),
                uuid: this.editForm.get(['id']).value,
                model: this.editForm.get(['selectedAggregate']).value,
                pagetitle: this.editForm.get(['pagetitle']).value,
                pagetemplate: this.editForm.get(['pagetemplate']).value,
                pagetype: 'api-page',
                params: this.apiParams,
                loginParams: this.loginParams,
                apiResourceDetails: this.apiResourceDetails,
                dashboardPanelDetails: this.dashboardPanelDetails,
                //   operation: this.editForm.get(['operation']).value,
                resourcePath: this.editForm.get(['resourcePath']).value,
                status: 'ENABLED',
                projectUuid: this.projectUid,
                pagestyle: this.pagestyle,
                pageViewType: 'singleWidget',
                authority: this.editForm.get(['authority']).value,
                isHomepage: this.editForm.get(['isHomepage']).value,
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
        if (this.editForm.get(['pagetitle']).value !== this.currentPage.pagetitle){
            this.eventManager.dispatch(
                new AppEvent(EventTypes.editorUITreeListModification, {
                    name: 'editorUITreeListModification',
                    content: 'Deleted an built in page',
                })
            );
        }
        this.pageTitle = this.editForm.get(['pagetitle']).value;
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
        const page = this.createFromForm();
        this.builtInPageService
            .findPageNameAvailability(page.pagetitle, this.currentPage.uuid, this.projectUid)
            .pipe(
                filter((res: HttpResponse<any>) => res.ok),
                map((res: HttpResponse<any>) => res.body)
            )
            .subscribe(
                (res: any) => {
                    if (res.IsNameExist) {
                        this.consoleLogService.writeConsoleLog('Page updated successfully');
                        this.save(page);
                    } else {
                        this.consoleLogService.writeConsoleLog('Page saved successfully');
                    }
                    this.save(page);
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
                this.ELEMENT_DATA.push(stepField);
                this.dataSourceWizard = new MatTableDataSource(this.ELEMENT_DATA);
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
            this.stepHeadersList.push({
                label: allStepControllers[i].value.stepHeading,
                value: allStepControllers[i].value.stepId + '-' + allStepControllers[i].value.stepHeading,
            });
        }
    }

    deleteFieldSteps(param) {
        const indexnum = this.ELEMENT_DATA.indexOf(param);
        this.ELEMENT_DATA.splice(indexnum, 1);
        this.dataSourceAIOParam = new MatTableDataSource(this.ELEMENT_DATA);

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
    addThirdPartyApi() {
        this.openAddApiDialog('', 'create');
    }

    openAddApiDialog(apiUUID , status) {
        const dialogRef = this.dialog.open(CustomPageApiDialogComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.projectUid,
                createStatus: status,
                uuid: apiUUID,
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            this.updateApiTable(result, result.operation, result.resourcePath);
            console.log(`Dialog result: ${result}`);
        });
    }

    apiObjArray() {

    }
}
