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
    onValChangeActionDataList: IButtonEvent[] = [];
    eventDisplayedColumns: string[] = ['button', 'event', 'action', 'page', 'api', 'actions'];
    pageEvents: SelectItem[] = [];

    visibilityOptions: SelectItem[] = [
        { label: 'Visible', value: 'Visible' },
        { label: 'Hide', value: 'Hide' },
    ];
    formControllers: SelectItem[] = [];
    resourcePathMethods: SelectItem[] = [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
    ];
    pageEventsActions: SelectItem[] = [

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
            visibilityOption: '',
            taregetFieldController: '',
        });
    }


    ngOnInit() {
        this.buildNewForm();
        if(this.data.fieldController === 'Button') {
            this.pageEvents.push({ label: 'ON-LOAD', value: 'ON-LOAD' });
            this.pageEvents.push({ label: 'ON-SUBMIT', value: 'ON-SUBMIT' });
            this.pageEvents.push({ label: 'AFTER-SUBMIT', value: 'AFTER-SUBMIT' });
            this.pageEventsActions.push({ label: 'CALL_PAGE_ONLOAD', value: 'CALL_PAGE_ONLOAD' });
            this.pageEventsActions.push({ label: 'CALL_API', value: 'CALL_API' });
            this.currentButton = this.data.button;
            this.btnEventActionList = this.data.btnEventActionList;
            this.pages = this.data.pages;
            this.editForm.get(['btnCaption']).patchValue(this.currentButton.caption);
            this.eventDataSource = new MatTableDataSource(this.btnEventActionList);
        } else if (this.data.fieldController === 'Dropdown' || this.data.fieldController === 'Radiobutton') {
            this.editForm.get(['pageEventAction']).patchValue('CHANGE_FORM_FIELD_VISIBILITY');
            this.pageEventsActions.push({ label: 'CHANGE_FORM_FIELD_VISIBILITY', value: 'CHANGE_FORM_FIELD_VISIBILITY' });
            this.eventDisplayedColumns = ['action', 'visibility', 'target', 'actions'];
            this.pageEvents.push({ label: 'ON-VALUE-CHANGE', value: 'ON-VALUE-CHANGE' });
            this.editForm.get(['pageEvent']).patchValue('ON-VALUE-CHANGE');
            if(this.data.events) {
                this.onValChangeActionDataList = this.data.events;
                this.eventDataSource = new MatTableDataSource(this.onValChangeActionDataList);
            }
        }
            for (let i = 0; i < this.data.formControllers.length; i++) {
                const controllerItem = {label: this.data.formControllers[i].propertyName, value: this.data.formControllers[i].propertyName};
                this.formControllers.push(controllerItem);
            }
    }

    addRow() {
        if(this.data.fieldController === 'Button') {
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
        } else if (this.data.fieldController === 'Radiobutton' || this.data.fieldController === 'Dropdown') {
            const pageEvent = 'OnChangedValue';
            const pageEventAction = this.editForm.get(['pageEventAction']).value;
            const visibilityType =  this.editForm.get(['visibilityOption']).value;
            const visibilityTarget =  this.editForm.get(['taregetFieldController']).value;
            if (pageEventAction && visibilityType && visibilityTarget) {
                const actionData: any = {
                    actionId: pageEventAction,
                    value: visibilityType,
                    target: visibilityTarget ,
                };
                this.onValChangeActionDataList.push(actionData);
                this.eventDataSource = new MatTableDataSource(this.onValChangeActionDataList);
            } else {
                // error message
            }
        }

    }

    deleteEventRow(param) {
        if(this.data.fieldController === 'Button') {
            const index = this.btnEventActionList.indexOf(param);
            this.btnEventActionList.splice(index, 1);
            this.eventDataSource = new MatTableDataSource(this.btnEventActionList);
        } else if (this.data.fieldController === 'Radiobutton') {
            const index = this.onValChangeActionDataList.indexOf(param);
            this.onValChangeActionDataList.splice(index, 1);
            this.eventDataSource = new MatTableDataSource(this.onValChangeActionDataList);
        }

    }

    save() {
        if(this.data.fieldController === 'Button') {
            this.dialogRef.close(this.btnEventActionList);
        } else if (this.data.fieldController === 'Radiobutton') {
            this.dialogRef.close(this.onValChangeActionDataList);
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
