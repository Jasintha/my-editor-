import {Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges, ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {BuiltInPageService} from '@core/projectservices/built-in-page.service';
import {ProjectService} from '@core/projectservices/project.service';
import { SelectItem } from 'primeng/api';

import { MessageService } from 'primeng/api';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {IPage, Page} from '@shared/models/model/page.model';
import { IWidget, Widget } from '@shared/models/model/widget.model';
import { Observable } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { BuiltInWidgetService } from '@core/projectservices/built-in-widget.service';
import { filter, map } from 'rxjs/operators';
import { MenuItem } from 'primeng/api';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import {WidgetSelectDialogComponent} from '@home/pages/built-in-page/widget-select-dialog.component';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {EventManagerService} from '@shared/events/event.type';
import {Grid, IGrid} from '@shared/models/model/grid.model';
import {FlexGrid, IFlexGrid, IGridPageMapping} from '@shared/models/model/flex.grid.model';
import {InitPageCreationComponent} from '@home/pages/built-in-page/init-page-creation.component';
import {CreateGridComponent} from '@home/pages/built-in-page/create-grid.component';
import {IButtonEvent} from '@shared/models/model/button-type.model';
import {MatTableDataSource} from '@angular/material/table';

@Component({
    selector: 'virtuan-flex-grid-handler',
    templateUrl: './flex-grid-handler.component.html',
    styleUrls: ['./built-in-page.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [MessageService],
})
export class FlexGridHandlerComponent implements OnInit, OnDestroy {
    @Input() projectUid: string;
    @Input() pageId: string;
    currentPage: IPage;
    editPageAsJson: boolean;
    editorOptions: any = { language: 'json', readOnly: false, renderLineHighlight: 'none' };
    code: string = '';
    pageTitle: string;
    pageDescription: string;
    editTitle = false;
    editDescription = false;
    grid: IFlexGrid;
    stepHeadersList: SelectItem[] = [];
    editForm: FormGroup;
    stepIndexId = 1;
    isSidebarVisible = false;
    selectedRowIndex: number;
    selectedContainerIndex: number;
    rowValues = '';
    isSelected = false;
    widgetCreationStatus = 'widgetTypeSelection';
    isSaving: boolean;
    builtInWidgets: IWidget[] = [];
    items: MenuItem[];
    tabView = 'tables-tab';
    colorMap: any;
    idArray: string[] = [];
    usedIdArray: string[] = [];
    availableIds: string[] = [];
    pages = [];
    allpages = [];
    pageContainerMappingsList: IGridPageMapping[] = [];
    containerMappingDisplayedColumns: string[] = ['container','page', 'actions'];
    containerMappingsDataSource = new MatTableDataSource(this.pageContainerMappingsList);
    protected ngbModalRef: NgbModalRef;

    constructor(
        protected builtInPageService: BuiltInPageService,
        protected activatedRoute: ActivatedRoute,
        protected projectService: ProjectService,
        private fb: FormBuilder,
        private spinnerService: NgxSpinnerService,
        private messageService: MessageService,
        protected builtInWidgetService: BuiltInWidgetService,
        protected router: Router,
        public dialog: MatDialog,
        private eventManager: EventManagerService,
    ) {}

    ngOnInit() {
        this.createColorMap();
        this.grid = new FlexGrid();
        this.editForm = this.fb.group({
            id: [],
            pagetitle: [],
            pageDescription: [],
            containerId: [],
            pageName: [],
        });
        this.updateForm();
        this.loadAllPages();
    }
    createColorMap() {
        this.idArray = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
        this.colorMap = new Map([
            ['A', '#FF5733'], ['B', '#FFBB33'], ['C', '#FFDA33'], ['D', '#FFEC33'], ['E', '#ECFF33'], ['F', '#CEFF33'],
            ['G', '#B2FF33'], ['H', '#A5FF33'], ['I', '#33FF4F'], ['J', '#34B646'], ['K', '#35F1B5'], ['L', '#35F1E6'], ['M', '#35C3F1'],
            ['N', '#3593F1'], ['O', '#8991EB'], ['P', '#BEA5F8'], ['Q', '#DCA5F8'], ['R', '#F2A5F8'], ['S', '#F16DAD'],
            ['T', '#F16D7B'], ['U', '#EB2252'], ['V', '#CDBADE'], ['W', '#BADECF'], ['X', '#CAD672'],    ['Y', '#C0A983'],    ['Z', '#A96757'],
        ]);
    }


    updateForm() {
        this.builtInPageService
            .find(this.pageId ,this.projectUid)
            .pipe(
                filter((mayBeOk: HttpResponse<IPage>) => mayBeOk.ok),
                map((response: HttpResponse<IPage>) => response.body)
            )
            .subscribe(
                (res: IPage) => {
                    this.loadUpdateForm(res);
                }
            );
        // this.activatedRoute.data.subscribe(({ builtInPage }) => {
        //   this.currentPage = builtInPage;
        //   this.updateForm(builtInPage);
        // });
    }

    loadUpdateForm(builtInPage) {
        this.currentPage = builtInPage;
        this.grid = builtInPage.pageGrid;
        if(builtInPage.gridPageMappings) {
            this.pageContainerMappingsList = builtInPage.gridPageMappings;
        }
        this.containerMappingsDataSource = new MatTableDataSource(this.pageContainerMappingsList);
        if(builtInPage.inputPageAsJson) {
            this.editPageAsJson = true;
        }
        this.code = builtInPage.pageJson;
        this.pageTitle = builtInPage.pagetitle;
        this.pageDescription = builtInPage.pageDescription
        this.editForm.get('pagetitle').patchValue(this.pageTitle, { emitEvent: true });
        this.editForm.get('pageDescription').patchValue(this.pageDescription, { emitEvent: true });
        this.getUsedIds(this.grid);
    }

    editPageTitle() {
        this.editTitle = !this.editTitle;
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

    editPageDesc() {
        this.editDescription = !this.editDescription;
    }

    deleteContainerMappingRow(param) {
        const index = this.pageContainerMappingsList.indexOf(param);
        this.pageContainerMappingsList.splice(index, 1);
        this.containerMappingsDataSource = new MatTableDataSource(this.pageContainerMappingsList);
    }

    onPageEditModeChanged() {
        if(this.editPageAsJson) {
            this.savePageAsJson();
        } else {
            this.updatePageGrid();
        }
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
                        //  this.consoleLogService.writeConsoleLog('Page json saved successfully');
                        //this.save(page);
                    },
                    (res: HttpErrorResponse) => this.onError(res.message)
                );
        }
    }

    addLayerOneChildGrid(rowIndex, columnIndex) {
        const dialogRef = this.dialog.open(CreateGridComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.projectUid,
                availableIds: this.getAvailableIds(),
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            if(result){
                this.getUsedIds(result);
                this.grid.rows[rowIndex].columns[columnIndex].grid = result;
                this.grid.rows[rowIndex].columns[columnIndex].isContainer = true;
            }
        });
    }

    addLayer2ChildGrid(rowIndex, columnIndex, childRowIndex, childColumnIndex) {
        const dialogRef = this.dialog.open(CreateGridComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.projectUid,
                availableIds: this.getAvailableIds(),
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            if(result){
                this.getUsedIds(result);
                this.grid.rows[rowIndex].columns[columnIndex].grid.rows[childRowIndex].columns[childColumnIndex].grid = result;
                this.grid.rows[rowIndex].columns[columnIndex].grid.rows[childRowIndex].columns[childColumnIndex].isContainer = true;
            }
        });
    }

    addLayer3ChildGrid(rowIndex, columnIndex, childRowIndex, childColumnIndex, layer3RowIndex, Layer3ColIndex) {
        const dialogRef = this.dialog.open(CreateGridComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.projectUid,
                availableIds: this.getAvailableIds(),
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            if(result){
                this.getUsedIds(result);
                this.grid.rows[rowIndex].columns[columnIndex].grid.rows[childRowIndex].columns[childColumnIndex].grid.rows[layer3RowIndex]
                    .columns[Layer3ColIndex].grid = result;
                this.grid.rows[rowIndex].columns[columnIndex].grid.rows[childRowIndex].columns[childColumnIndex]
                    .grid.rows[layer3RowIndex].columns[Layer3ColIndex].isContainer = true;
            }
        });
    }

    getUsedIds(grid: IFlexGrid) {
        for (let i = 0; i < grid.rows.length; i++) {
            for (let j = 0; j < grid.rows[i].columns.length; j++) {
                this.usedIdArray.push(grid.rows[i].columns[j].id);
                // [TODO] extend for child steps
                if(grid.rows[i].columns[j].grid && grid.rows[i].columns[j].grid.rows) {
                    for (let k = 0; k < grid.rows[i].columns[j].grid.rows.length; k++) {
                        for (let l = 0; l < grid.rows[i].columns[j].grid.rows[k].columns.length; l++) {
                            this.usedIdArray.push(grid.rows[i].columns[j].grid.rows[k].columns[l].id);
                            if(grid.rows[i].columns[j].grid.rows[k].columns[l].grid && grid.rows[i].columns[j].grid.rows[k].columns[l].grid.rows) {
                                for (let m = 0; m < grid.rows[i].columns[j].grid.rows[k].columns[l].grid.rows.length; m++) {
                                    for (let n = 0; n < grid.rows[i].columns[j].grid.rows[k].columns[l].grid.rows[m].columns.length; n++) {
                                        this.usedIdArray.push(grid.rows[i].columns[j].grid.rows[k].columns[l].grid.rows[m].columns[n].id);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    getAvailableIds() {
        const usedIdArray = this.usedIdArray;
        this.availableIds = this.idArray.filter(itm => usedIdArray.includes(itm) !== true);
        return this.availableIds;
    }

    checkPageNameExistAndSave() {
        const page = this.createFromForm();
        this.builtInPageService
            .findPageNameAvailability(page.pagetitle, page.uuid, this.projectUid)
            .pipe(
                filter((res: HttpResponse<any>) => res.ok),
                map((res: HttpResponse<any>) => res.body)
            )
            .subscribe(
                (res: any) => {
                    if (res.IsNameExist) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Name exists!',
                            detail: 'Entered page name is already exist. please use another',
                        });
                    } else {
                        this.updatePageBasicData(page);
                        //  this.updatePageGrid();
                    }
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
    }

    updatePageBasicData(builtInPage: IPage) {
        this.isSaving = true;
        const page = this.currentPage;
        page.inputPageAsJson = this.editPageAsJson;
        page.pagetitle = this.editForm.get(['pagetitle']).value;
        page.pageDescription = this.editForm.get(['pageDescription']).value;
        if (page.uuid && page.pagetitle) {
            this.subscribeToSaveResponse(this.builtInPageService.updatePageBasicData(builtInPage, this.projectUid));
        }
    }

    updatePageGrid() {
        this.isSaving = true;
        const page = this.currentPage;
        page.pageGrid = this.grid;
        page.inputPageAsJson = this.editPageAsJson;
        page.gridPageMappings = this.pageContainerMappingsList;
        this.isSaving = true;
        if (page.uuid && page.pageGrid && page.gridPageMappings) {
            this.subscribeToSaveResponse(this.builtInPageService.updatePageGridMappings(page, this.projectUid));
        }
    }

    // updatePageGrid() {
    //     if(this.grid && this.grid.rows) {
    //         for (let i = 0; i < this.grid.rows.length; i++) {
    //             for (let j = 0; j < this.grid.rows[i].containers.length; j++) {
    //                 if (this.grid.rows[i].containers[j].page) {
    //                     this.getPageDetails(this.grid.rows[i].containers[j].page, i, j);
    //                 }
    //             }
    //         }
    //     }
    // }

    getPageDetails(pageId, rowIndex, columnIndex) {
        this.builtInPageService
            .find(pageId ,this.projectUid)
            .pipe(
                filter((mayBeOk: HttpResponse<IPage>) => mayBeOk.ok),
                map((response: HttpResponse<IPage>) => response.body)
            )
            .subscribe(
                (res: IPage) => {
                    if(res && res.pagetitle) {
                        //   this.grid.rows[rowIndex].containers[columnIndex].pagetitle = res.pagetitle;
                        // this.grid.rows[rowIndex].containers[columnIndex].pagetype = res.pagetemplate;
                    }
                }
            );
    }

    private createFromForm(): IPage {
        this.pageTitle = this.editForm.get(['pagetitle']).value;
        return {
            ...new Page(),
            uuid: this.currentPage.uuid,
            projectUuid: this.projectUid,
            pagetitle: this.pageTitle,
            pageDescription: this.pageDescription,
            pageViewType: this.currentPage.pageViewType,
            pageGrid: this.grid,
            pagetemplate: this.currentPage.pagetemplate,
            status: 'ENABLED',
        };
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
        this.closeSideBar();
        this.messageService.add({
            severity: 'success',
            summary: 'Page updated',
            detail: 'Page data is updated',
        });
        this.editTitle = true;
    }

    protected onSaveError() {
        this.spinnerService.hide();
        this.isSaving = false;
    }
    protected onError(message) {
        this.spinnerService.hide();
    }

    protected closeSideBar() {
        this.isSelected = false;
        this.isSidebarVisible = false;
    }

    editWidget(pageId) {
        this.eventManager.dispatch(
            new AppEvent(EventTypes.editMultiWidgetPage, {
                name: 'editMultiWidgetPage',
                uuid: pageId,
                projectuuid: this.projectUid
            })
        );
        // const url = 'model-page/proj/' + this.projectUid + '/' + this.currentPage.uuid + '/' + page.uuid + '/page-layout';
        // this.router.navigate([url]);
    }

    addWidgets(rawIndex, containerIndex) {}

    ngOnDestroy() {
    }

    // openSelectPageDialog() {
    //     const dialogRef = this.dialog.open(WidgetSelectDialogComponent, {
    //         panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
    //         data: {
    //             projectUid: this.projectUid,
    //         }
    //     });
    //     dialogRef.afterClosed(
    //     ).subscribe(result => {
    //         if (result){
    //             this.setWidgetType(result);
    //         }
    //     });
    // }


    // setWidgetType(page) {
    //     //  this.grid.rows[this.selectedRowIndex].containers[this.selectedContainerIndex].page = page.uuid;
    //     this.checkPageNameExistAndSave();
    // }

    previousState() {
        window.history.back();
    }

    navigate(tabName) {
        this.tabView = tabName;
    }

    saveMapping() {
        const page =  this.editForm.get(['pageName']).value;
        const container = this.editForm.get(['containerId']).value;

        if (page !== null || container !== '') {
            const pageMapping: IGridPageMapping = {
                pageName: page.pagetitle ,
                pageId: page.uuid,
                refId: container,
            };
            this.pageContainerMappingsList.push(pageMapping);
            this.containerMappingsDataSource = new MatTableDataSource(this.pageContainerMappingsList);
        } else {
            // error message
        }
    }

    savePageGrid() {

    }
}
