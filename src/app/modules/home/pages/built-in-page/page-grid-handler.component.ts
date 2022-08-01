import {Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {BuiltInPageService} from '@core/projectservices/built-in-page.service';
import {ProjectService} from '@core/projectservices/project.service';
import { SelectItem } from 'primeng/api';

import { MessageService } from 'primeng/api';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {IPage, Page} from '@shared/models/model/page.model';
import { IWidget, Widget } from '@shared/models/model/widget.model';
import { Observable } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { BuiltInWidgetService } from '@core/projectservices/built-in-widget.service';
import { filter, map } from 'rxjs/operators';
import { MenuItem } from 'primeng/api';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import {WidgetSelectDialogComponent} from '@home/pages/built-in-page/widget-select-dialog.component';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {EventManagerService} from '@shared/events/event.type';
import {Grid, IGrid} from '@shared/models/model/grid.model';

@Component({
  selector: 'virtuan-page-grid-handler',
  templateUrl: './page-grid-handler.component.html',
  styleUrls: ['./built-in-widget.scss'],
  providers: [MessageService],
})
export class PageGridHandlerComponent implements OnInit, OnDestroy {
  @Input() projectUid: string;
  @Input() pageId: string;
  currentPage: IPage;
  pageTitle: string;
  formDisable = true;
  grid: IGrid;
  stepHeadersList: SelectItem[] = [];
  editForm: FormGroup;
  stepIndexId = 1;
  isSidebarVisible = false;
  selectedRowIndex: number;
  selectedContainerIndex: number;
  rowValues = '';
  isSelected = false;
  widgetCreationStatus = 'widgetTypeSelection';
  isSaving: boolean;
  builtInWidgets: IWidget[] = [];
  items: MenuItem[];
  tabView = 'tables-tab';
  protected ngbModalRef: NgbModalRef;

  constructor(
      protected builtInPageService: BuiltInPageService,
      protected activatedRoute: ActivatedRoute,
      protected projectService: ProjectService,
      private fb: FormBuilder,
      private spinnerService: NgxSpinnerService,
      private messageService: MessageService,
      protected builtInWidgetService: BuiltInWidgetService,
      protected router: Router,
      public dialog: MatDialog,
      private eventManager: EventManagerService,
  ) {}

  ngOnInit() {
    this.grid = new Grid();
    this.editForm = this.fb.group({
      id: [],
      pagetitle: [],
    });
    this.activatedRoute.params.subscribe(params => {
      this.updateForm();
    });
    // this.items = [
    //   {
    //     label: 'Form Widgets',
    //     items: [
    //       {
    //         label: 'Simple form ',
    //         icon: 'pi pi-fw pi-plus',
    //         command: () => {
    //           this.navigate('forms-tab');
    //         },
    //       },
    //       {
    //         label: 'Wizard form',
    //         icon: 'pi pi-fw pi-plus',
    //         command: () => {
    //           this.navigate('forms-tab');
    //         },
    //       },
    //     ],
    //   },
    //   {
    //     label: 'Table Widgets',
    //     items: [
    //       {
    //         label: 'Table',
    //         icon: 'pi pi-fw pi-plus',
    //         command: () => {
    //           this.navigate('tables-tab');
    //         },
    //       },
    //     ],
    //   },
    // ];
  }


  updateForm() {
    this.builtInPageService
        .find(this.pageId ,this.projectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<IPage>) => mayBeOk.ok),
            map((response: HttpResponse<IPage>) => response.body)
        )
        .subscribe(
            (res: IPage) => {
              this.loadUpdateForm(res);
            }
        );
    // this.activatedRoute.data.subscribe(({ builtInPage }) => {
    //   this.currentPage = builtInPage;
    //   this.updateForm(builtInPage);
    // });
  }

  loadUpdateForm(builtInPage) {
    this.currentPage = builtInPage;
    this.grid = builtInPage.pageGrid;
    this.pageTitle = builtInPage.pagetitle;
    this.editForm.get('pagetitle').patchValue(this.pageTitle, { emitEvent: true });
    this.updatePageGrid();
  }

  enableDisableForm() {
    this.formDisable = !this.formDisable;
  }

  selectApageForContainer(rawIndex, containerIndex) {
    this.isSidebarVisible = true;
    this.isSelected = true;
    this.selectedRowIndex = rawIndex;
    this.selectedContainerIndex = containerIndex;
    this.openSelectPageDialog();
    this.navigate('forms-tab');
  }

  // saveWidget(widgetTemplate: string) {
  //   this.spinnerService.show();
  //   this.isSaving = true;
  //   const currentWidget = this.createWidgetFromForm(widgetTemplate);
  //   if (currentWidget.uuid) {
  //     this.subscribeToSaveWidgetResponse(this.builtInWidgetService.update(currentWidget, this.projectUid));
  //   } else {
  //     this.subscribeToSaveWidgetResponse(this.builtInWidgetService.create(currentWidget, this.projectUid));
  //   }
  // }

  // private createWidgetFromForm(widgetTemplate: string): IWidget {
  //   return {
  //     ...new Widget(),
  //     widgettemplate: widgetTemplate,
  //     pageUuid: this.currentPage.uuid,
  //     status: 'init',
  //     projectUuid: this.projectUid,
  //     widgettype: 'api-page',
  //     widgetTitle: 'untitled',
  //   };
  // }

  checkPageNameExistAndSave() {
    const page = this.createFromForm();
    this.builtInPageService
        .findPageNameAvailability(page.pagetitle, page.uuid, this.projectUid)
        .pipe(
            filter((res: HttpResponse<any>) => res.ok),
            map((res: HttpResponse<any>) => res.body)
        )
        .subscribe(
            (res: any) => {
              if (res.IsNameExist) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Name exists!',
                  detail: 'Entered page name is already exist. please use another',
                });
              } else {
                this.updatePage(page);
                this.updatePageGrid();
              }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }

  // protected subscribeToSaveWidgetResponse(result: Observable<HttpResponse<IWidget>>) {
  //   result.subscribe(
  //     res => this.onWidgetSaveSuccess(res.body),
  //     () => this.onWidgetSaveError()
  //   );
  // }

  // protected onWidgetSaveSuccess(widget: IWidget) {
  //   this.spinnerService.hide();
  //   this.isSaving = false;
  //   this.addWidgetToGrid(widget);
  // }

  // protected onWidgetSaveError() {
  //   this.spinnerService.hide();
  //   this.isSaving = false;
  // }

  // addWidgetToGrid(widget: IWidget) {
  //   this.grid.rows[this.selectedRowIndex].containers[this.selectedContainerIndex].page = widget.uuid;
  //   this.grid.rows[this.selectedRowIndex].containers[this.selectedContainerIndex].widget.pageuuid = widget.pageUuid;
  //   this.grid.rows[this.selectedRowIndex].containers[this.selectedContainerIndex].widget.widgettemplate = widget.widgettemplate;
  //   this.grid.rows[this.selectedRowIndex].containers[this.selectedContainerIndex].widget.widgetTitle = widget.widgetTitle;
  //   this.checkPageNameExistAndSave();
  // }
  updatePageGrid() {
    if(this.grid && this.grid.rows) {
      for (let i = 0; i < this.grid.rows.length; i++) {
        for (let j = 0; j < this.grid.rows[i].containers.length; j++) {
          if (this.grid.rows[i].containers[j].page) {
            this.getPageDetails(this.grid.rows[i].containers[j].page, i, j);
          }
        }
      }
    }
  }

  getPageDetails(pageId, rowIndex, columnIndex) {
    this.builtInPageService
        .find(pageId ,this.projectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<IPage>) => mayBeOk.ok),
            map((response: HttpResponse<IPage>) => response.body)
        )
        .subscribe(
            (res: IPage) => {
              if(res && res.pagetitle) {
                this.grid.rows[rowIndex].containers[columnIndex].pagetitle = res.pagetitle;
                this.grid.rows[rowIndex].containers[columnIndex].pagetype = res.pagetemplate;
              }
            }
        );
  }

  updatePage(builtInPage) {
    this.spinnerService.show();
    this.isSaving = true;
    if (builtInPage.uuid) {
      builtInPage.status = this.currentPage.status;
      this.subscribeToSaveResponse(this.builtInPageService.update(builtInPage, this.projectUid));
    }
  }

  private createFromForm(): IPage {
    this.pageTitle = this.editForm.get(['pagetitle']).value;
    return {
      ...new Page(),
      uuid: this.currentPage.uuid,
      projectUuid: this.projectUid,
      pagetitle: this.pageTitle,
      pageViewType: this.currentPage.pageViewType,
      pageGrid: this.grid,
      pagetemplate: this.currentPage.pagetemplate,
      status: 'ENABLED',
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPage>>) {
    result.subscribe(
        () => this.onSaveSuccess(),
        () => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    this.spinnerService.hide();
    this.isSaving = false;
    this.closeSideBar();
    this.messageService.add({
      severity: 'success',
      summary: 'Page updated',
      detail: 'Page data is updated',
    });
    this.formDisable = true;
  }

  protected onSaveError() {
    this.spinnerService.hide();
    this.isSaving = false;
  }

  // findWidgetsForPage(projId: string, pageId: string) {
  //   this.spinnerService.show();
  //   this.builtInWidgetService
  //       .findAllWidgetsForaPage(projId, pageId)
  //       .pipe(
  //           filter((res: HttpResponse<IWidget[]>) => res.ok),
  //           map((res: HttpResponse<IWidget[]>) => res.body)
  //       )
  //       .subscribe(
  //           (res: IWidget[]) => {
  //             this.builtInWidgets = res;
  //             console.error(this.builtInWidgets);
  //             this.spinnerService.hide();
  //             //  this.updatePageGrid(this.builtInWidgets);
  //             // this.checkLoginRegistrationPages(res);
  //           },
  //           (res: HttpErrorResponse) => this.onError(res.message)
  //       );
  // }

  // updatePageGrid(widgetArray: IWidget[]) {
  //   for (let i = 0; i < this.grid.rows.length; i++) {
  //     for (let j = 0; j < this.grid.rows[i].containers.length; j++) {
  //       for (let k = 0; k < widgetArray.length; k++) {
  //         if (this.grid.rows[i].containers[j].page === widgetArray[k].uuid) {
  //           this.grid.rows[i].containers[j].page = widgetArray[k].widgettemplate;
  //           this.grid.rows[i].containers[j].page = widgetArray[k].widgetTitle;
  //         }
  //       }
  //     }
  //   }
  //   this.checkPageNameExistAndSave();
  // }

  protected onError(message) {
    this.spinnerService.hide();
  }

  protected closeSideBar() {
    this.isSelected = false;
    this.isSidebarVisible = false;
  }

  editWidget(pageId) {
    this.eventManager.dispatch(
        new AppEvent(EventTypes.editMultiWidgetPage, {
          name: 'editMultiWidgetPage',
          uuid: pageId,
          projectuuid: this.projectUid
        })
    );
    // const url = 'model-page/proj/' + this.projectUid + '/' + this.currentPage.uuid + '/' + page.uuid + '/page-layout';
    // this.router.navigate([url]);
  }

  addWidgets(rawIndex, containerIndex) {}

  ngOnDestroy() {
  }

  openSelectPageDialog() {
    const dialogRef = this.dialog.open(WidgetSelectDialogComponent, {
      panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
      data: {
        projectUid: this.projectUid,
      }
    });
    dialogRef.afterClosed(
    ).subscribe(result => {
      if (result){
        this.setWidgetType(result);
      }
    });
//         return false;
  }


  setWidgetType(page) {
    this.grid.rows[this.selectedRowIndex].containers[this.selectedContainerIndex].page = page.uuid;
    this.checkPageNameExistAndSave();
  }

  previousState() {
    window.history.back();
  }

  navigate(tabName) {
    this.tabView = tabName;
  }
}
