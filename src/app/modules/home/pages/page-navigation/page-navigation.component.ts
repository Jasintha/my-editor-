import {Component, Inject, OnInit} from '@angular/core';
import { IPage } from '@app/shared/models/model/page.model';
import {IPageNavigation, PageNavigation, PageParam} from '@shared/models/model/page-navigation.model';
import {SelectItem} from 'primeng/api';
import {IProject} from '@shared/models/model/project.model';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventManagerService} from '@shared/events/event.type';
import {APIInput} from '@shared/models/model/api-input.model';
import {MatTableDataSource} from '@angular/material/table';
import {BuiltInPageService} from '@core/projectservices/built-in-page.service';
import {ActivatedRoute} from '@angular/router';
import {ProjectService} from '@core/projectservices/project.service';
import {PageNavigationService} from '@core/projectservices/page-navigation.service';
import {Observable} from 'rxjs';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {IEvent} from '@shared/models/model/microservice-event.model';
import {filter, map} from 'rxjs/operators';
import {IProperty} from '@shared/models/model/property.model';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {IMainMenu} from '@shared/models/model/main-menu.model';

@Component({
  selector: 'virtuan-page-navigation',
  templateUrl: './page-navigation.component.html',
  styleUrls: ['./page-navigation.component.scss']
})
export class PageNavigationComponent implements OnInit {

  isSaving: boolean;
  allpages: IPage[];
  pages: SelectItem[];
  eventItems: SelectItem[];
  modelProperties: SelectItem[];
  //projectId: number;
  project: IProject;
  pageParams: PageParam[];
  projectUid: string;
  eventType: SelectItem[] = [
    { label: 'On load', value: 'e0' },
    { label: 'Click on Item', value: 'e1' },
  ];

  displayedColumns: string[] = ['name', 'property' ,'actions'];
  ELEMENT_DATA: PageParam[] = [];
  dataSource = new MatTableDataSource(this.ELEMENT_DATA);

  editForm = this.fb.group({
    id: [],
    event: ['', [Validators.required]],
    fromPage: ['', [Validators.required]],
    toPage: ['', [Validators.required]],
    paramName: [],
    paramProperty: [],
  });

  constructor(
      protected pageNavigationService: PageNavigationService,
      protected pageService: BuiltInPageService,
      protected activatedRoute: ActivatedRoute,
      private fb: FormBuilder,
      protected projectService: ProjectService,
      public dialogRef: MatDialogRef<PageNavigationComponent>,
      @Inject(MAT_DIALOG_DATA)  public data: any,
      protected eventManager: EventManagerService,
  ) {
  }

  ngOnInit(): void {
    this.getPageNavigationData();
  }

  getPageNavigationData() {
    this.projectUid = this.data.projectUid;
    // if (this.creatStatus == 'new') {
    //   this.editForm.reset();
    // }
    this.isSaving = false;
    this.pages = [];
    this.eventItems = [];
    this.modelProperties = [];
    this.pageParams = [];
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
                if (this.data.createStatus === 'Update') {
                  this.loadUpdateForm();
                }
              },
              (res: HttpErrorResponse) => this.onError(res.message)
          );
    }
  }

  loadPages() {
    for (let i = 0; i < this.allpages.length; i++) {
      const dropdownLabel = this.allpages[i].pagetitle;
      this.pages.push({ label: dropdownLabel, value: this.allpages[i] });
    }
  }

  loadUpdateForm() {
    this.pageNavigationService
        .find(this.data.uuid ,this.projectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<IMainMenu>) => mayBeOk.ok),
            map((response: HttpResponse<IMainMenu>) => response.body)
        )
        .subscribe(
            (res: IMainMenu) => {
              this.updateForm(res);
            }
        );
    //const obj = JSON.parse(this.rowData);
    //this.updateForm(obj);
  }

  async updateForm(pageNavigation: IPageNavigation) {
    this.modelProperties = [];
    if (pageNavigation.fromPage) {
      const currentPage: IPage = this.allpages.find(item => item.uuid === pageNavigation.fromPage.uuid);
      this.eventItems = [];
      let currentDatamodeProperties: IProperty[];
      if (currentPage.pagetype === 'api-page') {
        currentDatamodeProperties = currentPage.model.config.children;
        for (let i = 0; i < currentDatamodeProperties.length; i++) {
          if (currentDatamodeProperties[i].data.type === 'property') {
            const dropdownLabel = currentDatamodeProperties[i].label;
            this.modelProperties.push({ label: dropdownLabel, value: dropdownLabel });
          }
        }
      }

      this.editForm.patchValue({
        id: pageNavigation.uuid,
        event: pageNavigation.event,
        fromPage: this.allpages.find(item => item.uuid === pageNavigation.fromPage.uuid),
        toPage: this.allpages.find(item => item.uuid === pageNavigation.toPage.uuid),
      });
      this.pageParams = pageNavigation.pageParams;
      if (pageNavigation.fromPage && pageNavigation.fromPage.pagetemplate) {
        this.loadEventItems(pageNavigation.fromPage.pagetemplate);
      }
    }
  }

  previousState() {
    // this.isVisibleEvent.emit(false);
    this.dialogRef.close();
  }

  save() {
    // this.spinnerService.show();
    this.isSaving = true;
    const pageNavigation = this.createFromForm();
    if (pageNavigation.uuid) {
      this.subscribeToSaveResponse(this.pageNavigationService.update(pageNavigation, this.projectUid));
    } else {
      this.subscribeToSaveResponse(this.pageNavigationService.create(pageNavigation, this.projectUid));
    }
  }

  addRow() {
    const paramName = this.editForm.get(['paramName']).value;
    const paramProperty = this.editForm.get(['paramProperty']).value;

    if (paramName === '' || paramName === null || paramProperty === null) {
      // this.messageService.add({
      //   severity: 'warn',
      //   summary: 'Warn',
      //   detail: 'Please fill all the fields',
      // });
    } else {
      const param: PageParam = {
        name: paramName,
        propertyName: paramProperty,
      };

      this.pageParams.push(param);
      this.ELEMENT_DATA.push(param);
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    }
  }

  deleteRow(param) {
    const indexnum = this.ELEMENT_DATA.indexOf(param);
    this.ELEMENT_DATA.splice(indexnum, 1);
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);

    const index = this.pageParams.indexOf(param);
    this.pageParams.splice(index, 1);
  }

  onPageChange(event) {
    this.modelProperties = [];
    this.pageParams = [];
    const currentPage: IPage = event.value;
    this.loadEventItems(currentPage.pagetemplate);
    let currentDatamodeProperties: IProperty[];
    if (currentPage.pagetype === 'api-page') {
      currentDatamodeProperties = currentPage.model.config.children;
      for (let i = 0; i < currentDatamodeProperties.length; i++) {
        if (currentDatamodeProperties[i].data.type === 'property') {
          const dropdownLabel = currentDatamodeProperties[i].label;
          this.modelProperties.push({ label: dropdownLabel, value: dropdownLabel });
        }
      }
    }
  }

  getEventData(pagetemplate) {
    return this.pageService.findEventsForPageTemplate(pagetemplate, this.projectUid).toPromise();
  }

  async loadEventItems(pagetemplate) {
    this.eventItems = [];
    const res: HttpResponse<IEvent[]> = await this.getEventData(pagetemplate);
    const allevents: IEvent[] = res.body;
    for (let i = 0; i < allevents.length; i++) {
      const dropdownLabel = allevents[i].name;
      this.eventItems.push({ label: dropdownLabel, value: allevents[i] });
    }
  }

  private createFromForm(): IPageNavigation {
    return {
      ...new PageNavigation(),
      uuid: this.editForm.get(['id']).value,
      event: this.editForm.get(['event']).value,
      fromPage: this.editForm.get(['fromPage']).value,
      toPage: this.editForm.get(['toPage']).value,
      pageParams: this.pageParams,
      projectUuid: this.editForm.get(['fromPage']).value.projectUuid,
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPageNavigation>>) {
    result.subscribe(
        () => this.onSaveSuccess(),
        () => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    // this.spinnerService.hide();
    this.isSaving = false;
    this.eventManager.dispatch(
        new AppEvent(EventTypes.editorUITreeListModification, {
          name: 'editorUITreeListModification',
          content: 'Add an page navigation',
        })
    );
    this.previousState();
  }

  protected onSaveError() {
    // this.spinnerService.hide();
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }

  // ngOnDestroy() {
  //   this.toolbarTrackerService.setProjectUUID('');
  //   this.toolbarTrackerService.setIsEntityPage('no');
  // }

}
