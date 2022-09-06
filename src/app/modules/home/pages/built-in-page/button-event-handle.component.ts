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

@Component({
    selector: 'virtuan-page-action-event',
    templateUrl: './button-event-handle-component.html',
    providers: [MessageService],
    styleUrls: ['./built-in-page.component.scss'],
})
export class ButtonEventHandleComponent implements OnInit {
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
    pages = [];
    confirmationTypes = [];
    operationItems = [];
    BTN_ELEMENT_DATA = [];
    currentButton: IButtonType;
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
    constructor(
        protected eventManager: EventManagerService,
        protected accountService: AccountService,
        protected activatedRoute: ActivatedRoute,
        protected pageService: BuiltInPageService,
        @Inject(MAT_DIALOG_DATA)  public data: any,
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<ButtonEventHandleComponent>,
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
        });
    }


    ngOnInit() {
        this.currentButton = this.data.button;
        this.buildNewForm();
        this.editForm.get(['btnCaption']).patchValue(this.currentButton.caption);
    }

    saveEvent() {
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
