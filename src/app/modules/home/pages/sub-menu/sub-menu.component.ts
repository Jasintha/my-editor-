import {Component, Inject, OnInit} from '@angular/core';
import { IPage } from '@app/shared/models/model/page.model';
import {IDatamodel} from '@shared/models/model/datamodel.model';
import {IProject} from '@shared/models/model/project.model';
import {SelectItem} from 'primeng/api';
import {IMainMenu, MainMenu} from '@shared/models/model/main-menu.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BuiltInPageService} from '@core/projectservices/built-in-page.service';
import {ProjectService} from '@core/projectservices/project.service';
import {ActivatedRoute} from '@angular/router';
import {MainMenuService} from '@core/projectservices/main-menu.service';
import {CustomPageService} from '@core/projectservices/custom-page.service';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {filter, map} from 'rxjs/operators';
import { Observable } from 'rxjs';
import {IHybridfunction} from '@shared/models/model/hybridfunction.model';
import {IApi} from '@shared/models/model/microservice-api.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventManagerService} from '@shared/events/event.type';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {NgxSpinnerService} from 'ngx-spinner';
import {ISubMenu, SubMenu} from '@shared/models/model/sub-menu.model';

@Component({
  selector: 'virtuan-main-menu',
  templateUrl: './sub-menu.component.html',
  styleUrls: ['./sub-menu.component.scss']
})
export class SubMenuComponent implements OnInit {

  isSaving: boolean;
  pages: IPage[];
  projectId: string;
  project: IProject;
  datamodels: IDatamodel[];
  menuPageItems: SelectItem[];
  pageItems: SelectItem[];
  currentsubmenu: ISubMenu;
  currentmainmenu: IMainMenu;
  projectUid: string;
  mainMenuId: string;
  menuTypeItems: SelectItem[] = [
    { label: 'Link', value: 'link' },
    { label: 'Sub Heading', value: 'subheading' },
    { label: 'Dropdown', value: 'dropdown' },
  ];
  iconItems: SelectItem[] = [
    { label: 'Layers', value: 'icLayers' },
    { label: 'Assignment', value: 'icAssignment' },
    { label: 'Chat', value: 'icChat' },
    { label: 'DateRange', value: 'icDateRange' },
    { label: 'Contacts', value: 'icContacts' },
  ];
  editForm: FormGroup;
  typeSelected: string;

  buildMenuForm() {
    this.editForm = this.fb.group({
      id: [],
      name: ['', [Validators.required]],
      icon: ['', [Validators.required]],
      page: [],
    });
  }

  constructor(
      protected builtInPageService: BuiltInPageService,
      protected mainmenuService: MainMenuService,
      protected custompageService: CustomPageService,
      protected builtinpageService: BuiltInPageService,
      protected activatedRoute: ActivatedRoute,
      private fb: FormBuilder,
      protected projectService: ProjectService,
      public dialogRef: MatDialogRef<SubMenuComponent>,
      @Inject(MAT_DIALOG_DATA)  public data: any,
      protected eventManager: EventManagerService,
      private spinnerService: NgxSpinnerService,
  ) {
    this.typeSelected = 'square-jelly-box';
  }

  ngOnInit(): void {
    this.spinnerService.hide();
    this.loadAllPages();
  }

  // getMainMenuData() {
  //   this.projectUid = this.data.projectUid;
  //   this.buildMenuForm();
  //   // this.setMenuCategoryValidators();
  //   this.datamodels = [];
  //   this.pages = [];
  //   this.pageItems = [];
  //   this.menuPageItems = [];
  //   this.isSaving = false;
  //
  //   if (this.projectUid) {
  //     this.projectService
  //         .findWithPages(this.projectUid, this.projectUid)
  //         .pipe(
  //             filter((mayBeOk: HttpResponse<IProject>) => mayBeOk.ok),
  //             map((response: HttpResponse<IProject>) => response.body)
  //         )
  //         .subscribe(
  //             (res: IProject) => {
  //               this.project = res;
  //               this.datamodels = this.project.datamodels;
  //               this.pages = this.project.pages;
  //               this.loadPage();
  //               if (this.data.createStatus) {
  //                 this.loadUpdateForm();
  //               }
  //             },
  //             (res: HttpErrorResponse) => this.onError(res.message)
  //         );
  //   }
  // }


  loadAllPages() {
    this.findMainMenu()
    this.buildMenuForm();
    this.isSaving = false;
    this.projectUid = this.data.projectUid;
    this.pages = [];
    this.pageItems = [];
    if (this.projectUid) {
      this.builtInPageService
          .findBuiltInPagesForProjectId(this.projectUid, this.projectUid)
          .pipe(
              filter((res: HttpResponse<IPage[]>) => res.ok),
              map((res: HttpResponse<IPage[]>) => res.body)
          )
          .subscribe(
              (res: IPage[]) => {
                for(const page of res) {
                    this.pages.push(page);
                }
                this.loadPage();
                this.loadUpdateForm();
              },
              (res: HttpErrorResponse) => this.onError(res.message)
          );}
  }

  loadUpdateForm() {
    // const obj = JSON.parse(this.rowData);
    this.mainmenuService
        .findSubMenu(this.data.uuid, this.data.mainMenuId, this.data.projectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<ISubMenu>) => mayBeOk.ok),
            map((response: HttpResponse<ISubMenu>) => response.body)
        )
        .subscribe(
            (res: ISubMenu) => {
              this.updateForm(res);
            }
        );
  }

  loadPage() {
      for (let i = 0; i < this.pages.length; i++) {
        if (this.pages[i].status === 'ENABLED') {
          const dropdownLabel = this.pages[i].pagetitle;
          this.pageItems.push({ label: dropdownLabel, value: this.pages[i] });
        }
      }
  }

  findMainMenu() {
    // const obj = JSON.parse(this.rowData);
    this.mainmenuService
        .find(this.data.mainMenuId ,this.data.projectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<IMainMenu>) => mayBeOk.ok),
            map((response: HttpResponse<IMainMenu>) => response.body)
        )
        .subscribe(
            (res: IMainMenu) => {
              this.currentmainmenu = res;
            }
        );
  }

  updateForm(subMenu: ISubMenu) {
    this.editForm.patchValue({
      id: subMenu.uuid,
      name: subMenu.name,
      icon: subMenu.icon,
      page: this.pages.find(item => item.uuid === subMenu.page.uuid),
    });
  }

  previousState() {
    // this.isVisibleEvent.emit(false);
    this.dialogRef.close();
  }

  save() {
    this.spinnerService.show();
    this.isSaving = true;
    const submenu = this.createFromForm();
    if (submenu.uuid) {
      this.subscribeToSaveResponse(this.mainmenuService.updateSubMen(submenu, this.projectUid));
    } else {
      this.subscribeToSaveResponse(this.mainmenuService.createSubMenu(submenu, this.projectUid));
    }
  }

  private createFromForm(): ISubMenu {
      return {
        ...new SubMenu(),
        uuid: this.editForm.get(['id']).value,
        name: this.editForm.get(['name']).value,
        icon: this.editForm.get(['icon']).value,
        mainmenu: this.currentmainmenu,
        page: this.editForm.get(['page']).value,
        projectUuid: this.projectUid,
      };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IMainMenu>>) {
    result.subscribe(
        () => this.onSaveSuccess(),
        () => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    this.spinnerService.hide();
    this.isSaving = false;
    this.eventManager.dispatch(
        new AppEvent(EventTypes.editorUITreeListModification, {
          name: 'editorUITreeListModification',
          content: 'Add an main menu',
        })
    );
    this.previousState();
  }

  protected onSaveError() {
    this.spinnerService.hide();
    // this.spinnerService.hide();
    this.isSaving = false;
  }

  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }

  trackCustompageById(index: number, item: IPage) {
    return item.uuid;
  }

  trackBuiltinpageById(index: number, item: IPage) {
    return item.uuid;
  }

  trackPageById(index: number, item: IPage) {
    return item.uuid;
  }

  // ngOnDestroy() {
  //   this.toolbarTrackerService.setProjectUUID('');
  //   this.toolbarTrackerService.setIsEntityPage('no');
  // }

}
