import {Component, OnInit, Inject} from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import {MessageService, SelectItem} from 'primeng/api';

import { IPageConfig, Config } from '@shared/models/model/page-config.model';
import { IFormField, ISourceTargetFieldsRequest } from '@shared/models/model/form-field.model';
import {IPage, Page} from '@shared/models/model/page.model';
import { IDatamodel } from '@shared/models/model/datamodel.model';
import { BuiltInPageService } from '@core/projectservices/built-in-page.service';
import { AccountService } from '@core/auth/account.service';
import { EventManagerService } from '@shared/events/event.type';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@angular/forms';
import {IButtonType} from '@shared/models/model/button-type.model';
import {MatTableDataSource} from '@angular/material/table';
import {IProperty} from '@shared/models/model/property.model';
import {INavigationParam, NavigationParam} from '@shared/models/model/page-navigation.model';

@Component({
    selector: 'virtuan-page-action-event',
    templateUrl: './page-action-event.component.html',
    providers: [MessageService],
    styleUrls: ['./built-in-page.component.scss'],
})
export class PageActionEventComponent implements OnInit {
    configs: IPageConfig;
    eventSubscriber1: Subscription;
    eventSubscriber2: Subscription;
    cols: any[];
    pageId: string;
    page: IPage;
    sourceTargetFieldsRequest: ISourceTargetFieldsRequest;
    datamodel: IDatamodel;
    clonedCars: { [s: string]: Config } = {};
    sortField: string;
    sortOrder: number;
    projectUid: string;
    widgetId: string;
    isWidgetView: boolean;
    sourceProperties: IFormField[];
    targetProperties: IFormField[];
    modelProperties: SelectItem[];
    navigationParams: INavigationParam[] = [];
    displayedColumns: string[] = ['name', 'property' ,'actions'];
    dataSource = new MatTableDataSource(this.navigationParams);
    pages = [];
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
    BTN_ELEMENT_DATA = [];
    constructor(
        protected eventManager: EventManagerService,
        protected accountService: AccountService,
        protected activatedRoute: ActivatedRoute,
        protected pageService: BuiltInPageService,
        @Inject(MAT_DIALOG_DATA)  public data: any,
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<PageActionEventComponent>,
        private router: Router,
        private location: Location
    ) {
    }
    editForm: FormGroup;
    buildNewForm() {
        this.editForm = this.fb.group({
            id: [],
            btnCaption: [],
            btnResourcePath: [],
            btnOperation: [],
            navigatePage: [],
            btnColor: [],
            btnTooltip: [],
            btnConfirmationType: '',
            pageEventActionPage: '',
            pageEventAction: '',
            pageEvent: '',
            pageActionButton: '',
            pageEventActionApi: '',
            paramName: '',
            paramProperty: '',
        });
    }


    ngOnInit() {
        this.buildNewForm();
        this.setPageProperties();
    }

    setPageProperties() {
        this.modelProperties = [];
        const currentPage: IPage = this.data.currentPage;
        let currentDatamodeProperties: IProperty[];
        if (currentPage.pagetype === 'api-page') {
            currentDatamodeProperties = currentPage.model.config.children;
            for (let i = 0; i < currentDatamodeProperties.length; i++) {
                if (currentDatamodeProperties[i].data.type === 'property') {
                    const dropdownLabel = currentDatamodeProperties[i].label.toLowerCase( );
                    this.modelProperties.push({ label: dropdownLabel, value: dropdownLabel });
                }
            }
        }
    }
    addNavParam() {
        const paramName = this.editForm.get(['paramName']).value;
        const paramProperty = this.editForm.get(['paramProperty']).value;

        if (paramName === '' || paramName === null || paramProperty === null) {
            // this.messageService.add({
            //   severity: 'warn',
            //   summary: 'Warn',
            //   detail: 'Please fill all the fields',
            // });
        } else {
            const param: NavigationParam = {
                name: paramName,
                value: paramProperty,
            };

            this.navigationParams.push(param);
            this.dataSource = new MatTableDataSource(this.navigationParams);
        }
    }
    deleteNavParam(param) {
        const indexnum = this.navigationParams.indexOf(param);
        this.navigationParams.splice(indexnum, 1);
        this.dataSource = new MatTableDataSource(this.navigationParams);
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
                pageName,
                navigationParams: this.navigationParams
            };
            this.dialogRef.close(button);
         //   this.BTN_ELEMENT_DATA.push();
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
}
