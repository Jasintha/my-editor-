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
import {ProjectService} from '@core/projectservices/project.service';
import {Widget} from '@shared/models/model/widget.model';
import {FormControllers, IFormControllers} from '@shared/models/model/form-controllers.model';
import {BuiltInPageService} from '@core/projectservices/built-in-page.service';
import {MicroserviceInstallerService} from '@core/projectservices/microservice-installer.service';
import {EventManagerService} from '@shared/events/event.type';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {NgxSpinnerService} from 'ngx-spinner';
import {Column, FlexGrid, IFlexGrid, Row} from '@shared/models/model/flex.grid.model';

interface Item {
    value: any;
    label: string;
}
@Component({
    selector: 'virtuan-create-grid',
    templateUrl: './create-grid.component.html',
    styleUrls: ['./built-in-page.component.scss'],
})
export class CreateGridComponent implements OnInit, OnDestroy {
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
    selectedAggregate: IAggregate
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
    pageTitle = '';
    pageCreationStatus = 'typeSelection';
    gridStyle = '';
    gridArray: IFlexGrid[] = [];
    isSidebarVisible = false;
    selectedRowIndex: number;
    selectedContainerIndex: number;
    rowValues = '';
    isSelected = false;
    widgetCreationStatus = 'widgetTypeSelection';
    totalPageCount: number;
    grid: IFlexGrid;
    selectedFieldIndex: number;
    selectedChildIndex: number;
    availableIds: string[] = [];
    idIndex = 0;
    colorMap: any;
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
    typeSelected: string;
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
        protected projectService: ProjectService,
        protected microserviceService: MicroserviceInstallerService,
        protected eventManager: EventManagerService,
        public dialogRef: MatDialogRef<CreateGridComponent>,
        @Inject(MAT_DIALOG_DATA)  public data: any,
        private spinnerService: NgxSpinnerService,
    ) {
        this.typeSelected = 'square-jelly-box';
    }
    getGridArray() {
        this.gridArray = [
            {
                name: 'grid1',
                rows: [
                    { columns: [{ columnSize: 12, isContainer: false}] },
                    { columns: [{ columnSize: 12, isContainer: false}] },
                ],
            },
            {
                name: 'grid2',
                rows: [
                    { columns: [{ columnSize: 6, isContainer: false},{ columnSize: 6, isContainer: false}] },
                ],
            },
        ];
    }

    ngOnInit() {
        this.spinnerService.hide();
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
        this.selectedFieldIndex = 0;
        this.projectUid = this.data.projectUid;
        this.availableIds = this.data.availableIds;
        this.pageCreationStatus = 'customGrid';
        this.pageViewType = '';
        this.gridStyle = '';
        this.colorMap = new Map([
            ['A', '#FF5733'], ['B', '#FFBB33'], ['C', '#FFDA33'], ['D', '#FFEC33'], ['E', '#ECFF33'], ['F', '#CEFF33'],
            ['G', '#B2FF33'], ['H', '#A5FF33'], ['I', '#33FF4F'], ['J', '#34B646'], ['K', '#35F1B5'], ['L', '#35F1E6'], ['M', '#35C3F1'],
            ['N', '#3593F1'], ['O', '#8991EB'], ['P', '#BEA5F8'], ['Q', '#DCA5F8'], ['R', '#F2A5F8'], ['S', '#F16DAD'],
            ['T', '#F16D7B'], ['U', '#EB2252'], ['V', '#CDBADE'], ['W', '#BADECF'], ['X', '#CAD672'],    ['Y', '#C0A983'],    ['Z', '#A96757'],
        ]);
        this.createCustomGridForm();
        //   }
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

    save() {
        this.dialogRef.close(this.grid);
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IPage>>) {
        result.subscribe(
            () => this.onSaveSuccess(),
            () => this.onSaveError()
        );
    }

    protected onSaveSuccess() {
        this.spinnerService.hide();
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
        this.spinnerService.hide();
        this.isSaving = false;
    }

    protected onError(errorMessage: string) {
    }

    previousState() {}

    ngOnDestroy() {
    }

    gridStyles(isCustom: boolean, ind: number) {
        this.pageViewType = 'multiWidget';
        this.pageCreationStatus = 'addWidgets';
        if (!isCustom) {
            this.gridStyle = this.gridArray[ind].name;
            this.grid = this.gridArray[ind];
        }
        this.save();
        //  this.editForm.reset();
        //   this.pageCreationStatus = 'basicDetails';
    }

    getRow(columns) {
        const row = new Row();
        row.columns = [];
        for (let j = 0; j < columns.length ; j++) {
            const container =  { ...new Column(),  columnSize: columns[j].columnSize, color:columns[j].color, id:columns[j].id};
            row.columns.push(container);
        }
        return row;
    }

    //// ---- custom Grid ---- ////

    createCustomGridForm() {
        this.form = this.fb.group({
            formFieldsGroup: this.fb.array([
                new FormGroup({
                    columns: this.fb.array([new FormGroup({
                        columnSize: new FormControl(12),
                        id: new FormControl(this.getNextId()),
                        color: new FormControl(this.getColorForId(this.idIndex)),
                    })]),
                }),
            ]),
        });
    }

    insertFormControllersGroup() {
        this.formFieldsGroup.push(this.addFormFieldsGroup());
        this.insertColumnFormControllersGroup(this.formFieldsGroup.length -1);
    }

    addFormFieldsGroup(): FormGroup {
        return new FormGroup({
            columns: this.fb.array([]),
        });
    }

    saveCustomGrid() {
        // this.spinnerService.show();
        this.isSaving = true;
        const formData = this.createCustomGridFromForm();
        if (formData && formData.fieldList && formData.fieldList.length > 0) {
            const customGrid = new FlexGrid();
            const rowArray = [];
            for (let i = 0; i < formData.fieldList.length; i++) {
                const row =  this.getRow(formData.fieldList[i].columns);
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

    columnFormGroup(index) {
        return this.formFieldsGroup.controls[index]['controls'].columns as FormArray;
    }

    removeColumnFormController(index: number) {
        this.columnFormGroup(index).removeAt(index);
    }

    insertColumnFormControllersGroup(index) {
        this.selectedFieldIndex = index;
        this.columnFormGroup(index).push(this.addColumnFormFieldsGroup());
    }


    getMaxCount(rowIndex, columnIndex) {
        const columnsInRow = this.columnFormGroup(rowIndex);
        const selectedColumn = columnsInRow['controls'][columnIndex];
        let totalColumns = 0;
        for (let i = 0; i < columnsInRow.length; i++) {
            if(i !== columnIndex) {
                totalColumns += columnsInRow.controls[i]['controls'].columnSize.value
            }
        }
        if(totalColumns < 12) {
            return 12-totalColumns;
        }
        return 12
    }

    addColumnFormFieldsGroup(): FormGroup {
        return new FormGroup({
            columnSize: new FormControl(12),
            id: new FormControl(this.getNextId()),
            color: new FormControl(this.getColorForId(this.idIndex)),
        });
    }

    getNextId() {
        this.idIndex++;
        return this.availableIds[this.idIndex];
    }

    getColorForId(id) {
        return this.colorMap.get(id);
    }

    removeFormControllers(index: number) {
        this.formFieldsGroup.removeAt(index);
    }

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
