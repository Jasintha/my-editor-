import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
// import { NGXLogger } from 'ngx-logger';
import { SortEvent } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { ITheme, Theme } from '@shared/models/model/theme.model';
import {AccountService} from '@core/auth/account.service';
import { ThemeService } from './theme.service';
// import { ToolbarTrackerService } from 'app/core';
import { NgxSpinnerService } from 'ngx-spinner';
import {EventManagerService} from '@shared/events/event.type';
import { AppEvent } from '@shared/events/app.event.class';
import { EventTypes } from '@shared/events/event.queue';

@Component({
  selector: 'virtuan-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.scss'],
})
export class ThemeComponent implements OnInit, OnDestroy {
  themes: ITheme[];
  currentAccount: any;
  eventSubscriber: Subscription;
  // projectId: number;
  cols: any[];
  allThemeItems: SelectItem[];
  currentTheme: ITheme;
  themeImage: string;
  themeId: string;
  projectUid: string;

  isSidebarVisible: boolean = false;
  rowValues: string = '';
  isSelected: boolean = false;
  createStatus: string;

  editForm = this.fb.group({
    selectedTheme: [],
  });

  constructor(
    protected themeService: ThemeService,
    // private logger: NGXLogger,
    protected eventManager: EventManagerService,
    // protected toolbarTrackerService: ToolbarTrackerService,
    protected accountService: AccountService,
    private fb: FormBuilder,
    protected activatedRoute: ActivatedRoute,
    private spinnerService: NgxSpinnerService
  ) {
    // this.toolbarTrackerService.setIsEntityPage('yes');
  }

  loadAll() {
    this.themeService
      .query(null, this.projectUid)
      .pipe(
        filter((res: HttpResponse<ITheme[]>) => res.ok),
        map((res: HttpResponse<ITheme[]>) => res.body)
      )
      .subscribe(
        (res: ITheme[]) => {
          this.themes = res;
        },
        (res: HttpErrorResponse) => this.onError(res.message)
      );
  }

  loadThemesByProjectId(projId: string) {
    if (!projId) {
      this.loadAll();
    } else {
      this.spinnerService.show();
      this.themeService
        .findThemesForProjectId(projId, projId)
        .pipe(
          filter((res: HttpResponse<ITheme[]>) => res.ok),
          map((res: HttpResponse<ITheme[]>) => res.body)
        )
        .subscribe(
          (res: ITheme[]) => {
            this.themes = res;
            this.loadThemes();
            this.getSelectedTheme();
            this.spinnerService.hide();
          },
          (res: HttpErrorResponse) => this.onError(res.message)
        );
    }
  }

  handleChange(theme: Theme) {
    this.themeImage = theme.themestyle;
    this.themeId = theme.uuid;
    /*
    if(this.currentTheme){
    this.currentTheme.themeselected = false;
      if (this.currentTheme.uuid) {
        this.subscribeToSaveResponse(this.themeService.update(this.currentTheme));
      }
    }
    theme.themeselected = true;
    if (theme.uuid) {
      this.subscribeToSaveResponse(this.themeService.update(theme));
      this.currentTheme = theme;
    }
    */
  }

  save() {
    let theme: Theme = this.editForm.get(['selectedTheme']).value;

    if (this.currentTheme) {
      if (this.currentTheme.uuid) {
        this.currentTheme.themeselected = false;
        this.subscribeToSaveResponse(this.themeService.update(this.currentTheme, this.projectUid));

        theme.themeselected = true;
        if (theme.uuid) {
          this.subscribeToSaveResponse(this.themeService.update(theme, this.projectUid));
          this.currentTheme = theme;
        }
      }
    }
  }

  ngOnInit() {
    // this.loadAll();
    this.allThemeItems = [];
    this.activatedRoute.params.subscribe(params => {
      // this.projectId = params['projId'];
      this.projectUid = params['projectUid'];
      // this.toolbarTrackerService.setProjectUUID(this.projectUid);
    });
    this.loadThemesByProjectId(this.projectUid);
    this.accountService.identity().then(account => {
      this.currentAccount = account;
    });
    this.registerChangeInThemes();
    this.cols = [
      { field: 'themestyle', header: 'Theme Style' },
      { field: 'layoutorientationRTL', header: 'Layout Orientation RTL' },
      { field: 'toolbarposition', header: 'Toolbar Position' },
      { field: 'footerposition', header: 'Footer Position' },
      { field: 'footervisibility', header: 'Footer Visibility' },
    ];
  }

  updateForm(theme: ITheme) {
    this.editForm.patchValue({
      selectedTheme: theme,
    });
  }

  getSelectedTheme() {
    let isThemeSelected = false;
    if (this.themes && this.themes.length > 0) {
      for (let i = 0; i < this.themes.length; i++) {
        if (this.themes[i].themeselected === true) {
          isThemeSelected = true;
          this.currentTheme = this.themes[i];
          this.updateForm(this.currentTheme);
          this.themeImage = this.themes[i].themestyle;
          this.themeId = this.themes[i].uuid;
          break;
        }
      }
      if (!isThemeSelected) {
        this.themeImage = this.themes[0].themestyle;
        this.themeId = this.themes[0].uuid;
      }
    }
  }

  loadThemes() {
    if (this.themes && this.themes.length > 0) {
      for (let i = 0; i < this.themes.length; i++) {
        const dropdownLabel = 'Theme Style: ' + this.themes[i].themestyle;
        this.allThemeItems.push({ label: dropdownLabel, value: this.themes[i] });
      }
    }
  }

  customSort(event: SortEvent) {
    event.data.sort((data1, data2) => {
      let value1 = data1[event.field];
      let value2 = data2[event.field];
      let result = null;

      if (value1 === null && value2 != null) result = -1;
      else if (value1 != null && value2 === null) result = 1;
      else if (value1 === null && value2 === null) result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
      else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

      return event.order * result;
    });
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITheme>>) {
    result.subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    //this.isSaving = false;
    //this.previousState();
  }

  protected onSaveError() {
    //this.isSaving = false;
  }

  ngOnDestroy() {
    // this.toolbarTrackerService.setIsEntityPage('no');
    // this.toolbarTrackerService.setProjectUUID('');
    this.eventSubscriber.unsubscribe();
  }

  trackId(index: number, item: ITheme) {
    return item.uuid;
  }

  registerChangeInThemes() {
    // this.eventSubscriber = this.eventManager.subscribe('themeListModification', response => this.loadThemesByProjectId(this.projectUid));
    this.eventSubscriber = this.eventManager
      .on(EventTypes.themeListModification)
      .subscribe(event => this.loadThemesByProjectId(this.projectUid));
  }

  protected onError(errorMessage: string) {
    this.spinnerService.hide();
    // this.logger.error(errorMessage);
  }

  updateSideBarVisible() {
    this.isSidebarVisible = true;
    this.isSelected = true;
    this.rowValues = JSON.stringify(this.currentTheme);
    this.createStatus = 'update';
  }

  backSidebar($event) {
    this.isSidebarVisible = $event;
  }

  sidenavClosed() {
    this.loadThemesByProjectId(this.projectUid);
    this.registerChangeInThemes();
  }
}
