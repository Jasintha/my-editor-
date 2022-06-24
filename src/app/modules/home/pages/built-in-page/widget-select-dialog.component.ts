import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {IProject} from '@shared/models/model/project.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventManagerService} from '@shared/events/event.type';
import {IWidget} from '@shared/models/model/widget.model';
import {MenuItem, SelectItem} from 'primeng/api';
import {filter, map} from 'rxjs/operators';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {IPage} from '@shared/models/model/page.model';
import {BuiltInPageService} from '@core/projectservices/built-in-page.service';

@Component({
    selector: 'virtuan-page-select',
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
    builtInPages: IPage[];
    items: MenuItem[];

    constructor(
        protected activatedRoute: ActivatedRoute,
        private fb: FormBuilder,
        protected eventManager: EventManagerService,
        public dialogRef: MatDialogRef<WidgetSelectDialogComponent>,
        public builtInPageService: BuiltInPageService,
        @Inject(MAT_DIALOG_DATA)  public data: any,
    ) {}


    ngOnInit(): void {
        this.loadPagesByProjectId(this.data.projectUid);
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

    loadPagesByProjectId(projId: string) {
        if (projId) {
            // this.spinnerService.show();
            this.builtInPageService
                .findBuiltInPagesForProjectId(projId, projId)
                .pipe(
                    filter((res: HttpResponse<IPage[]>) => res.ok),
                    map((res: HttpResponse<IPage[]>) => res.body)
                )
                .subscribe(
                    (res: IPage[]) => {
                        this.builtInPages = res;
                    },
                    (res: HttpErrorResponse) => this.onError(res.message)
                );
        }
    }

    protected onError(errorMessage: string) {
        // this.spinnerService.hide();
        // this.logger.error(errorMessage);
    }
    navigate(tabName) {
        this.tabView = tabName;
    }
    setPage(widgetTemplate) {
        this.dialogRef.close(widgetTemplate);
    }
}
