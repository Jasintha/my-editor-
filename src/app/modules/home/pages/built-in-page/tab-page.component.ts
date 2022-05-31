import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {BuiltInPageService} from '@core/projectservices/built-in-page.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ProjectService} from '@core/projectservices/project.service';
import {MicroserviceInstallerService} from '@core/projectservices/microservice-installer.service';
import {EventManagerService} from '@shared/events/event.type';
import {PageConfigService} from '@core/projectservices/page-config.service';
import {MatDialog} from '@angular/material/dialog';
import {ConsoleLogService} from '@core/projectservices/console-logs.service';
import {filter, map} from 'rxjs/operators';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {IPage} from '@shared/models/model/page.model';
import {ITabbedPage, TabbedPage, TabPage} from '@shared/models/model/tab.page.model';
import {ILamdafunction, Lamdafunction} from '@shared/models/model/lamdafunction.model';
import {Observable} from 'rxjs';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
    selector: 'virtuan-tab-page-view',
    templateUrl: './tab-page.component.html',
    styleUrls: ['./built-in-page.component.scss'],
})
export class TabPageComponent implements OnDestroy, OnInit {
    @Input() projectUid: string;
    @Input() pageId: string;
    tabPages = [new TabPage('','Tab 1')];
    selected = new FormControl();
    allpages = [];
    pages = [];
    editForm: FormGroup;
    tabName = new FormControl();
    isSaving: boolean;
    formDisable: boolean;
    pageTitle: string;
    buildNewForm() {
        this.editForm = this.fb.group({
            pagetitle: '',
            id: [],
            tabName: '',
            page: []
        });
    }

    constructor(
        protected pageService: BuiltInPageService,
        protected builtInPageService: BuiltInPageService,
        protected activatedRoute: ActivatedRoute,
        private fb: FormBuilder,
        protected projectService: ProjectService,
        protected microserviceService: MicroserviceInstallerService,
        protected eventManager: EventManagerService,
        private router: Router,
        protected pageConfigService: PageConfigService,
        public dialog: MatDialog,
        private consoleLogService: ConsoleLogService,
        private spinnerService: NgxSpinnerService,
    ) {}

    ngOnInit() {
        this.buildNewForm();
        if (this.projectUid) {
            this.pageService
                .findBuiltInPagesForProjectId(this.projectUid, this.projectUid)
                .pipe(
                    filter((res: HttpResponse<IPage[]>) => res.ok),
                    map((res: HttpResponse<IPage[]>) => res.body)
                )
                .subscribe(
                    (res: IPage[]) => {
                        for(const page of res) {
                            if (page.uuid === this.pageId) {
                                this.pageTitle = page.pagetitle;
                                this.editForm.get('pagetitle').patchValue(page.pagetitle);
                            } else {
                                this.allpages.push(page);
                            }
                        }
                        this.loadPages();
                    },
                    (res: HttpErrorResponse) => this.onError(res.message)
                );
        }
    }

    addTab() {
        this.tabPages.push(new TabPage('','Tab '+ (this.tabPages.length + 1)));
        this.selected.setValue(this.tabPages.length - 1);
    }

    onTabPageChange(index) {
        this.tabPages[index].page = this.editForm.get(['page']).value;
    }

    removeTab(index: number) {
        this.tabPages.splice(index, 1);
    }
    ngOnDestroy() {
    }

    loadPages() {
        for (let i = 0; i < this.allpages.length; i++) {
            const dropdownLabel = this.allpages[i].pagetitle;
            this.pages.push({ label: dropdownLabel, value: this.allpages[i] });
        }
    }
    protected onError(errorMessage: string) {
        // this.logger.error(errorMessage);
    }

    save() {
        this.spinnerService.show();
        this.isSaving = true;
        const tabbedPage = this.createFromForm();
        if (tabbedPage.uuid) {
            this.subscribeToSaveResponse(this.pageService.updateTabPage(tabbedPage, this.projectUid));
        } else {
            this.subscribeToSaveResponse(this.pageService.createTabPage(tabbedPage, this.projectUid));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<ILamdafunction>>) {
        result.subscribe(
            () => this.onSaveSuccess(),
            () => this.onSaveError()
        );
    }

    enableToEdit() {
        this.formDisable = !this.formDisable;
    }

    protected onSaveSuccess() {
        this.spinnerService.hide();
        this.isSaving = false;
    }

    protected onSaveError() {
        this.spinnerService.hide();
        this.isSaving = false;
    }

    private createFromForm(): ITabbedPage {
        return {
            ...new TabbedPage(),
            tabPages: this.tabPages,
        };
    }

    getSelectedIndex(index) {
        const tab = this.tabPages[index];
        this.tabName.setValue(tab.tabName);
    }

    saveTabName(index){
        this.tabPages[index].tabName =  this.tabName.value;
    }

}
