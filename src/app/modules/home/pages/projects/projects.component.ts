import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { IProject } from '@shared/models/model/project.model';
import {AccountService} from '@core/auth/account.service';
import { ProjectsService } from './projects.service';
import { ActivatedRoute, Router } from '@angular/router';
// import { NgxSpinnerService } from 'ngx-spinner';
// import { EventManagerService } from 'app/shared/events/event.type';
// import { MenuItem } from 'primeng/api';

@Component({
  selector: 'virtuan-project',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.scss'],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  artifacts: IProject[];
  currentAccount: any;
  eventSubscriber: Subscription;
  activities: any[] = [];
  sortOptions: any;
  sortKey: string;
  sortField: string;
  sortOrder: number;
  // items: MenuItem[];
  projectUid = '123456';

  constructor(
    protected artifactsService: ProjectsService,
  //  private logger: NGXLogger,
  //   protected eventManager: EventManagerService,
    protected accountService: AccountService,
    protected activatedRoute: ActivatedRoute,
   // private modalService: NgbModal,
    private router: Router,
  //  private spinnerService: NgxSpinnerService
  ) {}

  showActivity(activity: any) {
    // this.activities[activity.id] === activity;
  }

  goToLink(activity: any) {
    if (activity.status === 'Active') {
      window.open(activity.link, '_blank');
    }

    //  ws = new WebSocket("ws://localhost:8080/ws")
  }

  loadAll() {
    this.artifactsService
      .loadAllArtifacts(this.projectUid)
      .pipe(
        filter((res: HttpResponse<IProject[]>) => res.ok),
        map((res: HttpResponse<IProject[]>) => res.body)
      )
      .subscribe(
        (res: IProject[]) => {
          this.artifacts = res;
        },
        (res: HttpErrorResponse) => this.onError(res.message)
      );
  }


  formatValues(value) {
    const dateTimeLength = 19;
    if (value) {
      return value.slice(0, dateTimeLength);
    }
  }

  ngOnInit() {
    this.sortOrder = -1;
    this.sortField = 'createdAt';
    //  this.wsService.subscribe();
    this.activatedRoute.params.subscribe(params => {
      this.projectUid = params.id;
      this.loadAll();
    });

    this.accountService.identity().then(account => {
      this.currentAccount = account;
    });
    this.sortOptions = [
      { label: 'Name', value: 'name' },
      { label: 'Namespace', value: 'namespace' },
      { label: 'RecentlyCreated', value: 'createdAt' },
    ];
  }

  ngOnDestroy() {
    // this.eventManager.destroy(this.eventSubscriber);
    // this.eventSubscriber.unsubscribe();
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

  onRowClick(data) {
    console.log(data);
  }

  protected onError(errorMessage: string) {
   // this.spinnerService.hide();
 //   this.logger.error(errorMessage);
  }

  routeToDetailPage(project) {
    let url = '';
    if (project.apptypesID === 'task.ui') {
      url = 'model-page/proj/' + project.projectUuid;
    } else if (project.apptypesID === 'design') {
      url = 'service-design/proj/' + project.projectUuid;
    } else {
      url = 'project/' + project.projectUuid + '/view';
    }
    this.router.navigate([url]);
  }
}
