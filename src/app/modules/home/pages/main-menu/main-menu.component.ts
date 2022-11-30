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

@Component({
  selector: 'virtuan-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {

  isSaving: boolean;
  pages: IPage[];
  projectId: string;
  project: IProject;
  datamodels: IDatamodel[];
  menuPageItems: SelectItem[];
  pageItems: SelectItem[];
  currentmainmenu: IMainMenu;
  projectUid: string;
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
    { label: 'dashboard', value: 'dashboard' },
    { label: 'account_balance', value: 'account_balance' },
    { label: 'currency_exchange', value: 'currency_exchange' },
    { label: 'receipt_long', value: 'receipt_long' },
    { label: 'event', value: 'event' },
    { label: 'settings', value: 'settings' },
    { label: 'settings_phone', value: 'settings_phone' },


  ];
  editForm: FormGroup;
  typeSelected: string;

  buildMenuForm() {
    this.editForm = this.fb.group({
      id: [],
      name: ['', [Validators.required]],
      menuType: ['', [Validators.required]],
      position: ['', [Validators.required]],
      authority: [''],
      icon: ['', [Validators.required]],
      datamodel: [],
      page: [],
    });
  }

  setMenuCategoryValidators() {
    this.editForm.get('menuType').valueChanges.subscribe(menuType => {
      if (menuType === 'link') {
        this.editForm.get('page').setValidators([Validators.required]);
        this.editForm.get('page').updateValueAndValidity();
      } else {
        this.editForm.get('page').clearValidators();
        this.editForm.get('page').updateValueAndValidity();
      }
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
      public dialogRef: MatDialogRef<MainMenuComponent>,
      @Inject(MAT_DIALOG_DATA)  public data: any,
      protected eventManager: EventManagerService,
      private spinnerService: NgxSpinnerService,
  ) {
    this.typeSelected = 'square-jelly-box';
  }

  ngOnInit(): void {
    this.spinnerService.hide();
    this.getMainMenuData();
  }

  getMainMenuData() {
    this.projectUid = this.data.projectUid;
    this.buildMenuForm();
    // this.setMenuCategoryValidators();
    this.datamodels = [];
    this.pages = [];
    this.pageItems = [];
    this.menuPageItems = [];
    this.isSaving = false;

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
        .find(this.data.uuid ,this.projectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<IMainMenu>) => mayBeOk.ok),
            map((response: HttpResponse<IMainMenu>) => response.body)
        )
        .subscribe(
            (res: IMainMenu) => {
              this.currentmainmenu = res;
              this.updateForm(res);
            }
        );
  }

  loadPage() {
    if (this.data.formTree){
      for (let i = 0; i < this.pages.length; i++) {
        if (this.pages[i].status === 'ENABLED') {
          const dropdownLabel = this.pages[i].pagetitle;
          this.pageItems.push({ label: dropdownLabel, value: this.pages[i] });
        } else if(this.pages[i].pageViewType === 'multiWidget' || this.pages[i].pageViewType === 'tabbed') {
          const dropdownLabel = this.pages[i].pagetitle;
          this.pageItems.push({ label: dropdownLabel, value: this.pages[i] });
        }
      }
    }else {
      this.editForm.patchValue({
        page:  this.data.page,
      });
    }
  }

  onPageChange(event) {
    const page = this.editForm.get(['page']).value;
    this.editForm.patchValue({
      authority:  page.authority.join(),
    });
  }

  updateForm(mainmenu: IMainMenu) {
    this.editForm.patchValue({
      id: mainmenu.uuid,
      name: mainmenu.name,
      menuType: mainmenu.menuType,
      position: mainmenu.position,
      icon: mainmenu.icon,
      page: this.pages.find(item => item.uuid === mainmenu.page.uuid),
      datamodel: mainmenu.datamodel,
    });
  }

  previousState() {
    // this.isVisibleEvent.emit(false);
    this.dialogRef.close();
  }

  save() {
    this.spinnerService.show();
    this.isSaving = true;
    const mainmenu = this.createFromForm();
    if (mainmenu.uuid) {
      mainmenu.status = this.currentmainmenu.status;
      this.subscribeToSaveResponse(this.mainmenuService.update(mainmenu, this.projectUid));
    } else {
      this.subscribeToSaveResponse(this.mainmenuService.create(mainmenu, this.projectUid));
    }
  }

  private createFromForm(): IMainMenu {
    if (this.editForm.get(['menuType']).value === 'link') {
      return {
        ...new MainMenu(),
        uuid: this.editForm.get(['id']).value,
        name: this.editForm.get(['name']).value,
        menuType: this.editForm.get(['menuType']).value,
        position:this.editForm.get(['position']).value,
        icon: this.editForm.get(['icon']).value,
        page: this.editForm.get(['page']).value,
        datamodel: this.editForm.get(['datamodel']).value,
        projectUuid: this.projectUid,
      };
    } else {
      return {
        ...new MainMenu(),
        uuid: this.editForm.get(['id']).value,
        name: this.editForm.get(['name']).value,
        menuType: this.editForm.get(['menuType']).value,
        icon: this.editForm.get(['icon']).value,
        position:this.editForm.get(['position']).value,
        datamodel: this.editForm.get(['datamodel']).value,
        projectUuid: this.projectUid,
      };
    }
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
