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
import {IButtonEvent, IButtonType} from '@shared/models/model/button-type.model';
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
    btnEventActionList: IButtonEvent[] = [];
    eventDataSource = new MatTableDataSource(this.btnEventActionList);
    currentButton: IButtonType;
    eventDisplayedColumns: string[] = ['button', 'event', 'action', 'page', 'api', 'actions'];
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
        this.btnEventActionList = this.data.btnEventActionList;
        this.pages = this.data.pages;
        this.buildNewForm();
        this.editForm.get(['btnCaption']).patchValue(this.currentButton.caption);
        this.eventDataSource = new MatTableDataSource(this.btnEventActionList);
    }

    addRow() {
        const btnCaption =  this.editForm.get(['btnCaption']).value;
        const pageEvent = this.editForm.get(['pageEvent']).value;
        const pageEventAction = this.editForm.get(['pageEventAction']).value;
        const pageEventActionPage = this.editForm.get(['pageEventActionPage']).value;
        const pageEventActionApi = this.editForm.get(['pageEventActionApi']).value;

        if (btnCaption !== null || pageEvent !== '' || pageEventAction !== null) {
            const button: IButtonEvent = {
                btnCaption ,
                event: pageEvent,
                eventAction: pageEventAction,
                pageId: pageEventActionPage,
                resourcePath: this.getBtnResourcePath(pageEventActionApi),
            };
            this.btnEventActionList.push(button);
            this.eventDataSource = new MatTableDataSource(this.btnEventActionList);
        } else {
            // error message
        }
    }

    deleteEventRow(param) {
        const index = this.btnEventActionList.indexOf(param);
        this.btnEventActionList.splice(index, 1);
        this.eventDataSource = new MatTableDataSource(this.btnEventActionList);
    }

    save() {
        this.dialogRef.close(this.btnEventActionList);
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
