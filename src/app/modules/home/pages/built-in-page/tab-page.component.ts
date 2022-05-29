import {Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
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

@Component({
    selector: 'virtuan-tab-page-view',
    templateUrl: './tab-page.component.html',
    styleUrls: ['./built-in-page.component.scss'],
})
export class TabPageComponent implements OnDestroy, OnChanges {
    @Input() projectUid: string;
    @Input() pageId: string;
    tabs = ['Tab 1', 'Tab 2', 'Tab 3'];
    selected = new FormControl();
    allpages = [];
    pages = [];
    editForm: FormGroup;
    selectedTabName: string;
    tabName = new FormControl();

    buildNewForm() {
        this.editForm = this.fb.group({
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
        private consoleLogService: ConsoleLogService
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        this.buildNewForm();
        const index = this.tabs[0];
        this.tabName.setValue(index);
        if (this.projectUid) {
            this.pageService
                .findBuiltInPagesForProjectId(this.projectUid, this.projectUid)
                .pipe(
                    filter((res: HttpResponse<IPage[]>) => res.ok),
                    map((res: HttpResponse<IPage[]>) => res.body)
                )
                .subscribe(
                    (res: IPage[]) => {
                        this.allpages = res;
                        this.loadPages();
                        // if (this.data.createStatus === 'Update') {
                        //     this.loadUpdateForm();
                        // }
                    },
                    (res: HttpErrorResponse) => this.onError(res.message)
                );
        }
    }

    addTab() {
        this.tabs.push('Tab '+ (this.tabs.length + 1));
        this.selected.setValue(this.tabs.length - 1);
    }

    removeTab(index: number) {
        this.tabs.splice(index, 1);
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

    save(){}

    getSelectedIndex(val){
        const index = this.tabs[val];
        this.tabName.setValue(index);
        this.selectedTabName = index;
    }

    saveTabName(val){
        const name = this.tabName.value;
        this.tabs[val] = name;
    }

}
