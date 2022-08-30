import {ChangeDetectorRef, Component, Inject, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
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
import {EventManagerService} from '@shared/events/event.type';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {NgxSpinnerService} from 'ngx-spinner';
import {trigger, state, style, transition, animate} from '@angular/animations';
import {IFormField} from '@shared/models/model/form-field.model';
import {IEpicService} from '@shared/models/model/epic-service.model';
import {EpicServiceGenReq, IEpicServiceBuildStatus} from '@shared/models/model/epic-service-build-status.model';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {WebsocketService} from '@core/tracker/websocket.service';
import {BreakpointTrackerService} from '@core/tracker/breakpoint.service';
import {IGenerator} from '@shared/models/model/generator-chain.model';

@Component({
  selector: 'virtuan-build-view',
  templateUrl: './build-view.component.html',
  styleUrls: ['./build-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class BuildViewComponent implements OnInit {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  isSaving: boolean;
  isGenerated = false;
  displayedColumns: string[] = [ 'lastbuildstatus', 'servicename', 'lastrungenerator', 'statusinfo'];
  columnHeaders = { lastbuildstatus: 'Last build status', servicename: 'Service name', statusinfo: 'Status info',  lastrungenerator: 'Last run generator',}
  servicesToGenerate: IEpicService[] = [];
  buildStatusData: IEpicServiceBuildStatus[] = [];
  dataSource: MatTableDataSource<IEpicServiceBuildStatus>;
  isBuildLogAvailable: boolean;
  expandedElement: IEpicServiceBuildStatus | null;
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];
  isGenerating: boolean;
  reload: boolean;
  theme: string = 'vs-dark';
  editorOptions: any = { language: 'json', readOnly: true, renderLineHighlight: 'none' };
  code: string = '';
  generatorList: { [key: number]: string } = {};
  generatorChain: IGenerator[];
  genTypes: SelectItem[] = [
    { label: 'All', value: 'All' },
    { label: 'Custom', value: 'Custom' },
  ];
  editForm: FormGroup;
  typeSelected: string;
  sourceProperties: IEpicService[] = [];
  targetProperties: IEpicService[] = [];
  buildGenForm() {
    this.editForm = this.fb.group({
      id: [],
      genType: ['', [Validators.required]],
      selectedServices: []
    });
    this.editForm.get('genType').patchValue('All', {emitEvent: true});
  }
  constructor(
      protected builtInPageService: BuiltInPageService,
      protected mainmenuService: MainMenuService,
      protected custompageService: CustomPageService,
      protected builtinpageService: BuiltInPageService,
      protected activatedRoute: ActivatedRoute,
      private fb: FormBuilder,
      protected projectService: ProjectService,
      protected eventManager: EventManagerService,
      private spinnerService: NgxSpinnerService,
      private socket: WebsocketService,
      private breakpointService: BreakpointTrackerService,
      private cdr: ChangeDetectorRef,
  ) {
    this.typeSelected = 'square-jelly-box';
  }

  ngOnInit(): void {

    this.spinnerService.hide();
    this.buildGenForm();
    this.sourceProperties = [];
    this.targetProperties = [];
    this.buildStatusData = [];
    this.getBuildstatusData();
    this.loadServicesForGenerate();
    this.dataSource = new MatTableDataSource(this.buildStatusData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  previousState() {
    // this.isVisibleEvent.emit(false);
  }
  generate() {
    this.spinnerService.show();
    this.isSaving = true;
    const genReq = this.createFromForm();
    this.getBuildstatusData();
    this.loadGenLogs();
    if (genReq.services.length > 0) {
      this.subscribeToSaveResponse(this.projectService.generateServices(genReq));
    }
  }

  refreshLogs(){
    this.getBuildstatusData();
  }

  private createFromForm(): EpicServiceGenReq {
    const servicesIdList = [];
    const servicesToGenerate = this.editForm.get(['selectedServices']).value;
    if(this.editForm.get(['selectedServices']).value === 'All') {
      for (let i = 0; i < this.servicesToGenerate.length; i++) {
        servicesIdList.push(this.servicesToGenerate[i].serviceUUID);
      }
    } else {
      for (let i = 0; i < servicesToGenerate.length; i++) {
        servicesIdList.push(servicesToGenerate[i].serviceUUID);
      }
    }
    return {
      ...new EpicServiceGenReq(),
      services: servicesIdList,
    };
  }

  getBuildstatusData () {
    this.projectService
        .getBuildStatusData()
        .pipe(
            filter((mayBeOk: HttpResponse<IEpicServiceBuildStatus[]>) => mayBeOk.ok),
            map((response: HttpResponse<IEpicServiceBuildStatus[]>) => response.body)
        )
        .subscribe(
            (res: IEpicServiceBuildStatus[]) => {
              this.buildStatusData = res;
              this.dataSource = new MatTableDataSource(this.buildStatusData);
              this.cdr.detectChanges();
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
              this.isBuildLogAvailable = true;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
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
  // ngOnDestroy() {
  //   this.toolbarTrackerService.setProjectUUID('');
  //   this.toolbarTrackerService.setIsEntityPage('no');
  // }

  loadServicesForGenerate() {
    this.projectService
        .findServicesForGen()
        .pipe(
            filter((mayBeOk: HttpResponse<IEpicService[]>) => mayBeOk.ok),
            map((response: HttpResponse<IEpicService[]>) => response.body)
        )
        .subscribe(
            (res: IEpicService[]) => {
              this.servicesToGenerate = res;
              this.sourceProperties = this.servicesToGenerate;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }



  loadGenLogs() {
    this.socket.getEventListener().subscribe(event => {
      if (event.type === 'message') {
        const topic = event.data.topic;
        if (topic === 'generator') {
          const data = event.data.content;

          let projectUUID = '';
          let status = '';
          let time = '';
          let position = -1;

          const allKeyValuePairs = data.split(',');
          if (allKeyValuePairs) {
            allKeyValuePairs.forEach(keyval => {
              const keyAndValArr = keyval.split('=', 2);
              let key = '';
              let val = '';

              if (keyAndValArr) {
                for (let i = 0; i < keyAndValArr.length; i++) {
                  if (i === 0) {
                    key = keyAndValArr[i];
                  } else {
                    val = keyAndValArr[i];
                  }
                }
              }

              if (key === 'projectuuid') {
                projectUUID = val;
              } else if (key === 'status') {
                status = val;
              } else if (key === 'time') {
                time = val;
              } else if (key === 'position') {
                position = +val;
              }
            });
          }

         // if (uuid === projectUUID) {
            if (status) {
              if (status.trim() === 'didnot') {
                if(this.code !== '') {
                  this.code = this.code + ',\n';
                }
                this.code = this.code + '{"status": "Error", "detail": "Generation failed at '+ this.generatorList[position] + '"}';

              } else if (status.trim() === 'done') {
                if(this.code !== '') {
                  this.code = this.code + ',\n';
                }
                this.code = this.code + '{"status": "Success", "detail": "Generation successful at '+ this.generatorList[position] + '"}';

              } else if (status.trim() === 'done') {
                if(this.code !== '') {
                  this.code = this.code + ',\n';
                }
                this.code = this.code + '{"status": "In progress", "detail": "Generation started at '+ this.generatorList[position] + '"}';
              }
            }
          }
        }
     // }
    });
  }

}