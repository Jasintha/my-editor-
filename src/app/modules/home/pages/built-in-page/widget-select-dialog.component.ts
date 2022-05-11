import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {IProject} from '@shared/models/model/project.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventManagerService} from '@shared/events/event.type';
import {IWidget} from '@shared/models/model/widget.model';
import {MenuItem} from 'primeng/api';

@Component({
    selector: 'virtuan-widget-select',
    templateUrl: './widget-select-dialog.component.html',
    styleUrls: ['./built-in-widget.scss']
})
export class WidgetSelectDialogComponent implements OnInit {

    isSaving: boolean;
    project: IProject;
    editForm: FormGroup;
    projectUid: string;
    uuid: string
    createStatus: string
    tabView = 'tables-tab';
    items: MenuItem[];

    constructor(
        protected activatedRoute: ActivatedRoute,
        private fb: FormBuilder,
        protected eventManager: EventManagerService,
        public dialogRef: MatDialogRef<WidgetSelectDialogComponent>,
        @Inject(MAT_DIALOG_DATA)  public data: any,
    ) {}


    ngOnInit(): void {
        this.items = [
            {
                label: 'Form Widgets',
                items: [
                    {
                        label: 'Simple form ',
                        icon: 'pi pi-fw pi-plus',
                        command: () => {
                            this.navigate('forms-tab');
                        },
                    },
                    {
                        label: 'Wizard form',
                        icon: 'pi pi-fw pi-plus',
                        command: () => {
                            this.navigate('forms-tab');
                        },
                    },
                ],
            },
            {
                label: 'Table Widgets',
                items: [
                    {
                        label: 'Table',
                        icon: 'pi pi-fw pi-plus',
                        command: () => {
                            this.navigate('tables-tab');
                        },
                    },
                ],
            },
        ];
    }
    navigate(tabName) {
        this.tabView = tabName;
    }
    setWidgetType(widgetTemplate) {
        this.dialogRef.close(widgetTemplate);
    }
}
