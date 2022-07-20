import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ITheme, Theme } from '@shared/models/model/theme.model';
// import { ToolbarTrackerService } from 'app/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'virtuan-theme-detail',
  templateUrl: './theme-detail.component.html',
})
export class ThemeDetailComponent implements OnInit, OnDestroy {
  theme: ITheme;
  //projectId: number;
  projectUid: string;

  constructor(
    protected activatedRoute: ActivatedRoute,
    // protected toolbarTrackerService: ToolbarTrackerService,
    private spinnerService: NgxSpinnerService
  ) {
    // this.toolbarTrackerService.setIsEntityPage('yes');
  }

  ngOnInit() {
    this.spinnerService.show();
    this.activatedRoute.params.subscribe(params => {
      // this.projectId = params['projId'];
      this.projectUid = params['projectUid'];
      // this.toolbarTrackerService.setProjectUUID(this.projectUid);
    });
    this.activatedRoute.data.subscribe(({ theme }) => {
      this.theme = theme;
      this.spinnerService.hide();
    });
  }

  previousState() {
    window.history.back();
  }

  ngOnDestroy() {
    // this.toolbarTrackerService.setIsEntityPage('no');
    // this.toolbarTrackerService.setProjectUUID('');
  }
}
