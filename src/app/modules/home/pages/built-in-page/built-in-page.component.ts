import { Component, OnInit } from '@angular/core';
import { IPage } from '@app/shared/models/model/page.model';
import {Subscription} from 'rxjs';
import {IProject} from '@shared/models/model/project.model';
import {BuiltInPageService} from '@core/projectservices/built-in-page.service';
import {EventManagerService} from '@shared/events/event.type';
import {AccountService} from '@core/auth/account.service';
import {ToolbarTrackerService} from '@core/tracker/toolbar-tracker.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ProjectService} from '@core/projectservices/project.service';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {filter, map} from 'rxjs/operators';
import {EventTypes} from '@shared/events/event.queue';
import { SortEvent } from 'primeng/api';

@Component({
  selector: 'virtuan-built-in-page',
  templateUrl: './built-in-page.component.html',
  styleUrls: ['./built-in-page.component.scss']
})
export class BuiltInPageComponent implements OnInit {

  builtInPages: IPage[];
  currentAccount: any;
  isLoginPageExist: boolean;
  isRegisterPageExist: boolean;
  isHomePageExist: boolean;
  eventSubscriber: Subscription;
  project: IProject;
  cols: any[];
  projectUid: string;

  isSidebarVisible = false;
  rowValues = '';
  isSelected = false;
  createStatus: string;
  sortField: string;
  sortOrder: number;
  sortOptions: any;
  sortKey: string;

  constructor(
      protected builtInPageService: BuiltInPageService,
      protected eventManager: EventManagerService,
      protected accountService: AccountService,
      protected activatedRoute: ActivatedRoute,
      protected projectService: ProjectService,
      protected router: Router
  ) {
  }

  loadAll() {
    this.builtInPageService
        .query(null, this.projectUid)
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

  loadPagesByProjectId(projId: string) {
    if (!projId) {
      this.loadAll();
    } else {
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
                // this.spinnerService.hide();
                this.checkLoginRegistrationPages(res);
              },
              (res: HttpErrorResponse) => this.onError(res.message)
          );
    }
  }

  checkLoginRegistrationPages(pages: IPage[]) {
    this.isLoginPageExist = false;
    this.isRegisterPageExist = false;
    this.isHomePageExist = false;
    const that = this;
    pages.forEach(function (value) {
      if (value.pagetemplate === 'login-page') {
        that.isLoginPageExist = true;
      } else if (value.pagetemplate === 'register-page') {
        that.isRegisterPageExist = true;
      } else if (value.isHomepage === true) {
        that.isHomePageExist = true;
      }
    });
  }

  ngOnInit() {
    // this.loadAll();
    this.activatedRoute.params.subscribe(params => {
      this.projectUid = params['projectUid'];
      console.log(this.projectUid);
      if (this.projectUid) {
        this.projectService
            .find(this.projectUid)
            .pipe(
                filter((mayBeOk: HttpResponse<IProject>) => mayBeOk.ok),
                map((response: HttpResponse<IProject>) => response.body)
            )
            .subscribe(
                (res: IProject) => {
                  this.project = res;
                  if (this.project.apptypesID === 'task.ui') {
                    this.cols = [
                      { field: 'pagetitle', header: 'Page Title' },
                      { field: 'pagetemplate', header: 'Page Template' },
                      { field: 'model', header: 'Model' },
                      { field: 'status', header: 'Status' },
                    ];
                  } else {
                    this.cols = [
                      { field: 'pagetitle', header: 'Page Title' },
                      { field: 'pagetemplate', header: 'Page Template' },
                      { field: 'datamodel', header: 'Model' },
                      { field: 'status', header: 'Status' },
                    ];
                  }
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
      }
    });
    this.loadPagesByProjectId(this.projectUid);
    this.accountService.identity().then(account => {
      this.currentAccount = account;
    });

    this.registerChangeInPages();
  }

  openPageControllerConfig(pageId: string) {
    // this.ngbModalRef = this.modalService.open(AddFormControllersComponent as Component, {
    //   size: 'lg',
    //   backdrop: 'static',
    // });
    // this.ngbModalRef.componentInstance.pageId = pageId;
    // this.ngbModalRef.componentInstance.projectUid = this.projectUid;
    // this.ngbModalRef.result.then(
    //     result => {
    //       this.ngbModalRef = null;
    //     },
    //     reason => {
    //       this.ngbModalRef = null;
    //     }
    // );
  }

  openPageAttributeConfig(pageId: string) {
    // this.toolbarTrackerService.setPageID(pageId);
    const url: string = '/page-config/proj/' + this.projectUid;
    this.router.navigate([url], { queryParams: { pageId: pageId } });
  }

  onSortChange(event) {
    const value = event.value;
    if (value.indexOf('!') === 0) {
      this.sortOrder = -1;
      this.sortField = value.substring(1, value.length);
    } else {
      this.sortOrder = value === 'createdAt' ? -1 : 1;
      this.sortField = value;
    }
  }
  viewPageLayout(page) {
    const url = 'model-page/proj' + this.projectUid + '/' + page.uuid + '/edit';
    this.router.navigate([url]);
  }

  customSort(event: SortEvent) {
    event.data.sort((data1, data2) => {
      const value1 = data1[event.field];
      const value2 = data2[event.field];
      let result = null;

      if (value1 === null && value2 != null) {
        result = -1;
      } else if (value1 != null && value2 === null) {
        result = 1;
      } else if (value1 === null && value2 === null) {
        result = 0;
      } else if (typeof value1 === 'string' && typeof value2 === 'string') {
        result = value1.localeCompare(value2);
      } else {
        result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
      }
      return event.order * result;
    });
  }

  // ngOnDestroy() {
  //   // this.toolbarTrackerService.setIsEntityPage('no');
  //   // this.toolbarTrackerService.setProjectUUID('');
  //   // this.eventManager.destroy(this.eventSubscriber);
  //   this.eventSubscriber.unsubscribe();
  // }

  trackId(index: number, item: IPage) {
    return item.uuid;
  }

  registerChangeInPages() {
    // this.eventSubscriber = this.eventManager.subscribe('builtInPageListModification', response =>
    //   this.loadPagesByProjectId(this.projectUid)
    // );
    this.eventSubscriber = this.eventManager
        .on(EventTypes.builtInPageListModification)
        .subscribe(event => this.loadPagesByProjectId(this.projectUid));
  }

  protected onError(errorMessage: string) {
    // this.spinnerService.hide();
    // this.logger.error(errorMessage);
  }

  disablePage(item: IPage) {
    // const modalRef = this.modalService.open(BuiltInPageChangeStatusDialogComponent, { size: 'lg', backdrop: 'static' });
    // modalRef.componentInstance.projectUid = this.projectUid;
    // modalRef.componentInstance.page = item;
    // modalRef.componentInstance.enable = false;
    // modalRef.result.then(
    //     result => {
    //       // Left blank intentionally, nothing to do here
    //     },
    //     reason => {
    //       // Left blank intentionally, nothing to do here
    //     }
    // );
  }

  enablePage(item: IPage) {
    // const modalRef = this.modalService.open(BuiltInPageChangeStatusDialogComponent, { size: 'lg', backdrop: 'static' });
    // modalRef.componentInstance.projectUid = this.projectUid;
    // modalRef.componentInstance.page = item;
    // modalRef.componentInstance.enable = true;
    // modalRef.result.then(
    //     result => {
    //       // Left blank intentionally, nothing to do here
    //     },
    //     reason => {
    //       // Left blank intentionally, nothing to do here
    //     }
    // );
  }

  updateSideBarVisible(rowData: any) {
    this.isSidebarVisible = true;
    this.isSelected = true;
    this.rowValues = JSON.stringify(rowData);
    this.createStatus = 'update';
  }

  newSideBarVisible() {
    this.isSidebarVisible = true;
    this.isSelected = true;
    this.createStatus = 'new';
  }

  backSidebar($event) {
    this.isSidebarVisible = $event;
  }

  sidenavClosed() {
    this.loadPagesByProjectId(this.projectUid);
  }

  navigateToPage(page: IPage) {
    let url = '';
    if (page.pageViewType === 'singleWidget') {
      url = 'model-page/proj/' + this.projectUid + '/' + page.uuid + '/page-layout';
    } else {
      url = 'model-page/proj/' + this.projectUid + '/' + page.uuid + '/page-grid';
    }
    this.router.navigate([url], { queryParams: { pageId: page.uuid } });
  }

  createPage() {
    // const modalRef = this.modalService.open(InitPageCreationComponent as Component, {
    //   size: 'xl',
    //   backdrop: 'static',
    // });
    // modalRef.componentInstance.projectUid = this.projectUid;
    // modalRef.componentInstance.totalPageCount = this.builtInPages.length;
    // modalRef.result.then(
    //     result => {
    //       this.loadPagesByProjectId(this.projectUid);
    //       this.ngbModalRef = null;
    //     },
    //     reason => {
    //       this.ngbModalRef = null;
    //     }
    // );
  }

}
