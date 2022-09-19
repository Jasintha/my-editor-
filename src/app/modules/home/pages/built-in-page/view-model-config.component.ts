import {Component, OnInit, OnDestroy, Inject, Input, ViewEncapsulation, OnChanges} from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { SortEvent } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';

import { IPageConfig, PageConfig, IConfig, Config } from '@shared/models/model/page-config.model';
import { IPageAction, PageAction } from '@shared/models/model/page-action.model';
import {IFormField, FormField, ISourceTargetFieldsRequest, IRowFieldMapping} from '@shared/models/model/form-field.model';
import { IPage } from '@shared/models/model/page.model';
import { IDatamodel } from '@shared/models/model/datamodel.model';
import { IProperty } from '@shared/models/model/property.model';
import { BuiltInPageService } from '@core/projectservices/built-in-page.service';
import { AccountService } from '@core/auth/account.service';
import { PageConfigService } from '@core/projectservices/page-config.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { EventManagerService } from '@shared/events/event.type';
import { EventTypes } from '@shared/events/event.queue';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BuiltInWidgetService } from '@core/projectservices/built-in-widget.service';
import {MatTableDataSource} from '@angular/material/table';
@Component({
    selector: 'virtuan-view-model-config',
    templateUrl: './view-model-config.component.html',
    providers: [MessageService],
    styleUrls: ['./built-in-page.component.scss'],
    styles: [
        `
            :host ::ng-deep .ui-toast {
                top: 80px;
            }
            :host ::ng-deep .news-active .ui-toast {
                top: 150px;
            }
            @media screen and (max-width: 64em) {
                :host ::ng-deep .ui-toast {
                    top: 110px;
                }
                :host ::ng-deep .news-active .ui-toast {
                    top: 180px;
                }
            }
        `,
        '.scroll-bar{overflow: scroll;max-height: 150px;width: 100%;overflow-x: auto;}',
        '::-webkit-scrollbar {width: 5px;}',
        '::-webkit-scrollbar-thumb {background: #257bff;border-radius: 5px;}',
        '::-webkit-scrollbar-thumb:hover {background: #002386;}',
    ],
})
export class ViewModelConfigComponent implements OnChanges, OnDestroy {

    @Input('pageId') pageId: string;
    @Input('projectUid') projectUid: string;
    @Input('widgetUid') widgetUid: string;
    pageConfigs: IConfig[];
    pageActions: IPageAction[];
    configs: IPageConfig;
    currentAccount: any;
    eventSubscriber1: Subscription;
    cols: any[];
    page: IPage;
    sourceTargetFieldsRequest: ISourceTargetFieldsRequest;
    datamodel: IDatamodel;
    clonedCars: { [s: string]: Config } = {};
    sortField: string;
    sortOrder: number;
    widgetId: string;
    isWidgetView: boolean;
    sourceProperties: IFormField[];
    targetProperties: IFormField[];
    pageViewModelFields: IFormField[] = [];
    fieldMapDisplayedColumns: string[] = ['group','field','visibility'];
    fieldDataSourceWizard = new MatTableDataSource(this.pageViewModelFields);

    constructor(
        private messageService: MessageService,
        //  protected pageActionService: PageActionService,
        protected pageConfigService: PageConfigService,
        protected eventManager: EventManagerService,
        protected accountService: AccountService,
        protected activatedRoute: ActivatedRoute,
        private spinnerService: NgxSpinnerService,
        protected pageService: BuiltInPageService,
        protected builtInWidgetService: BuiltInWidgetService,
        private router: Router,
        private location: Location
    ) {
    }

    loadAll() {
        this.pageConfigService
            .query(null, this.projectUid)
            .pipe(
                filter((res: HttpResponse<IPageConfig[]>) => res.ok),
                map((res: HttpResponse<IPageConfig[]>) => res.body)
            )
            .subscribe(
                (res: IPageConfig[]) => {
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
    }

    loadPageConfigsByPageId(pageId: string, uuid: string) {
        if (!pageId) {
            this.loadAll();
        } else {
            this.spinnerService.show();
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
                        this.spinnerService.hide();
                    },
                    (res: HttpErrorResponse) => this.onError(res.message)
                );
        }
    }

    // loadPageActionsByPageId(pageId: string, uuid: string) {
    //     if (!pageId) {
    //     } else {
    //         this.spinnerService.show();
    //         this.pageActionService
    //             .findPageActionsForPageId(pageId, uuid)
    //             .pipe(
    //                 filter((res: HttpResponse<IPageAction[]>) => res.ok),
    //                 map((res: HttpResponse<IPageAction[]>) => res.body)
    //             )
    //             .subscribe(
    //                 (res: IPageAction[]) => {
    //                     this.pageActions = res;
    //                     this.spinnerService.hide();
    //                 },
    //                 (res: HttpErrorResponse) => this.onError(res.message)
    //             );
    //     }
    // }

    loadPageDatamodelByPageId(pageId: string, uuid: string) {
        if (!pageId) {
        } else {
            // this.spinnerService.show();
            this.pageService
                .find(pageId, uuid)
                .pipe(
                    filter((res: HttpResponse<IPage>) => res.ok),
                    map((res: HttpResponse<IPage>) => res.body)
                )
                .subscribe(
                    (res: IPage) => {
                        this.page = res;
                        this.datamodel = res.datamodel;
                        this.sourceProperties = [];
                        const currentDatamodeProperties: IProperty[] = this.datamodel.properties;
                        for (let i = 0; i < currentDatamodeProperties.length; i++) {
                            const input: FormField = {
                                propertyName: currentDatamodeProperties[i].name,
                                isLinkedProperty: false,
                                selectType: '',
                            };
                            this.sourceProperties.push(input);
                        }
                        // this.spinnerService.hide();
                    },
                    (res: HttpErrorResponse) => this.onError(res.message)
                );
        }
    }

    loadAllSourceTargetFormFieldsForPage(pageId: string, uuid: string) {
        if (!pageId) {
        } else {
            // this.spinnerService.show();
            this.pageService
                .findAllSourceTargetFormFieldsForPage(pageId, uuid)
                .pipe(
                    filter((res: HttpResponse<ISourceTargetFieldsRequest>) => res.ok),
                    map((res: HttpResponse<ISourceTargetFieldsRequest>) => res.body)
                )
                .subscribe(
                    (res: ISourceTargetFieldsRequest) => {
                        this.pageViewModelFields = [];
                        this.sourceTargetFieldsRequest = res;
                        this.sourceProperties = this.sourceTargetFieldsRequest.sourceFormFields;
                        this.targetProperties = this.sourceTargetFieldsRequest.targetFormFields;
                        // this.spinnerService.hide();
                        this.pageViewModelFields = this.targetProperties;
                    },
                    (res: HttpErrorResponse) => this.onError(res.message)
                );
        }
    }

    ngOnChanges() {
        this.pageConfigs = [];
        this.sourceProperties = [];
        this.targetProperties = [];
        this.pageViewModelFields = [];
        this.pageViewModelFields = this.targetProperties;
        this.activatedRoute.queryParams.subscribe(params => {
            //  this.pageId = params['pageId'];
        });
        // this.pageId = this.toolbarTrackerService.getPageID();
        //  this.widgetId = this.toolbarTrackerService.getWidgetID();
        this.loadPageConfigsByPageId(this.pageId, this.projectUid);
        this.loadAllSourceTargetFormFieldsForPage(this.pageId, this.projectUid);
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInPageConfigs();
        // this.registerChangeInPageActions();
        this.cols = [
            { field: 'name', header: 'Name' },
            { field: 'actionType', header: 'Action Type' },
        ];
    }

    loadAllSourceTargetFormFieldsForWidget(pageId: string, uuid: string) {
        if (!pageId) {
        } else {
            // this.spinnerService.show();
            this.builtInWidgetService
                .findAllSourceTargetFormFieldsForWidget(pageId, uuid)
                .pipe(
                    filter((res: HttpResponse<ISourceTargetFieldsRequest>) => res.ok),
                    map((res: HttpResponse<ISourceTargetFieldsRequest>) => res.body)
                )
                .subscribe(
                    (res: ISourceTargetFieldsRequest) => {
                        this.sourceTargetFieldsRequest = res;
                        this.sourceProperties = this.sourceTargetFieldsRequest.sourceFormFields;
                        this.targetProperties = this.sourceTargetFieldsRequest.targetFormFields;
                        // this.spinnerService.hide();
                    },
                    (res: HttpErrorResponse) => this.onError(res.message)
                );
        }
    }

    saveFormOrder() {
        this.savePageFormOrder();
    }

    savePageFormOrder() {
        this.pageService
            .savePageFormOrder(this.targetProperties, this.pageId, this.projectUid)
            .pipe(
                filter((res: HttpResponse<any>) => res.ok),
                map((res: HttpResponse<any>) => res.body)
            )
            .subscribe(
                (res: any) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved Form Order' });
                },
                (res: HttpErrorResponse) => this.onSaveError()
            );
    }

    saveWidgetFormOrder() {
        this.builtInWidgetService
            .saveWidgetFormOrder(this.targetProperties, this.widgetId, this.projectUid)
            .pipe(
                filter((res: HttpResponse<any>) => res.ok),
                map((res: HttpResponse<any>) => res.body)
            )
            .subscribe(
                (res: any) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved Form Order' });
                },
                (res: HttpErrorResponse) => this.onSaveError()
            );
    }

    customSort(event: SortEvent) {
        event.data.sort((data1, data2) => {
            let value1 = data1[event.field];
            let value2 = data2[event.field];
            let result = null;

            if (value1 === null && value2 != null) result = -1;
            else if (value1 != null && value2 === null) result = 1;
            else if (value1 === null && value2 === null) result = 0;
            else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
            else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

            return event.order * result;
        });
    }

    onSortChange(event) {
        const value = event.value;
        if (value.indexOf('!') === 0) {
            this.sortOrder = -1;
            this.sortField = value.substring(1, value.length);
        } else {
            this.sortOrder = 1;
            this.sortField = value;
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
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Value is required' });
        }
    }

    onRowEditCancel(car: Config, index: number) {
        this.pageConfigs[index] = this.clonedCars[car.property];
        delete this.clonedCars[car.property];
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IPageConfig>>) {
        result.subscribe(
            () => this.onSaveSuccess(),
            () => this.onSaveError()
        );
    }

    protected onSaveSuccess() {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Config is updated' });
    }

    protected onSaveError() {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error occurred while saving' });
    }

    ngOnDestroy() {
        // this.eventManager.destroy(this.eventSubscriber);
        this.eventSubscriber1.unsubscribe();
    }

    trackId(index: number, item: IPageConfig) {
        return item.uuid;
    }

    registerChangeInPageConfigs() {
        // this.eventSubscriber = this.eventManager.subscribe('pageConfigListModification', response =>
        //   this.loadPageConfigsByPageId(this.pageId, this.projectUid)
        // );
        this.eventSubscriber1 = this.eventManager
            .on(EventTypes.pageConfigListModification)
            .subscribe(event => this.loadPageConfigsByPageId(this.pageId, this.projectUid));
    }


    protected onError(errorMessage: string) {
        this.spinnerService.hide();
        //  this.logger.error(errorMessage);
    }
    previousState() {
        this.location.back();
    }
}
