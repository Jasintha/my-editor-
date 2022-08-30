import {Component, Inject, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
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
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  isSaving: boolean;
  isGenerated = false;
  displayedColumns: string[] = ['servicename', 'lastbuildstatus', 'lastrungenerator', 'statusinfo'];
  servicesToGenerate: IEpicService[] = [];
  buildStatusData: IEpicServiceBuildStatus[] = [];
  dataSource: MatTableDataSource<IEpicServiceBuildStatus>;
  isBuildLogAvailable: boolean;
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
  ) {
    this.typeSelected = 'square-jelly-box';
  }

  ngOnInit(): void {

    this.spinnerService.hide();
    this.buildGenForm();
    this.sourceProperties = [];
    this.targetProperties = [];
    this.buildStatusData = [];
    this.loadServicesForGenerate();
    this.addDummyData();
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
    if (genReq.services.length > 0) {
      this.subscribeToSaveResponse(this.projectService.generateServices(genReq));
    }
  }

  private createFromForm(): EpicServiceGenReq {
    const servicesToGenerate = this.editForm.get(['selectedServices']).value;
    const servicesIdList = [];
    for (let i = 0; i < servicesToGenerate.length; i++) {
      servicesIdList.push(servicesToGenerate[i].serviceUUID);
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


  addDummyData (){
    this.isBuildLogAvailable = true;
    this.servicesToGenerate = [{
      uuid: '2312323',
      name: 'Service 0',
      referenceName: 'Srv0',
      serviceUUID: '12123xxx'
    },
      {
        uuid: '2312323',
        name: 'Service 1',
        referenceName: 'Srv1',
        serviceUUID: '12123xxx'
      },
      {
        uuid: '2312323',
        name: 'Service 2',
        referenceName: 'Srv2',
        serviceUUID: '12123xxx'
      },
      {
        uuid: '2312323',
        name: 'Service 3',
        referenceName: 'Srv3',
        serviceUUID: '12123xxx'
      },{
        uuid: '2312323',
        name: 'Service 4',
        referenceName: 'Srv4',
        serviceUUID: '12123xxx'
      },{
        uuid: '2312323',
        name: 'Service 5',
        referenceName: 'Srv5',
        serviceUUID: '12123xxx'
      },{
        uuid: '2312323',
        name: 'Service 6',
        referenceName: 'Srv6',
        serviceUUID: '12123xxx'
      }
    ];
    this.buildStatusData = [{
      servicename: 'service 1',
      lastbuildstatus: 'lastbuildstatus',
      referenceName:  'referenceName',
      apptype:  'apptype',
      serviceuuid:  'serviceuuid',
      lastrungenerator:  'lastrungenerator',
      lastrungenid:  'lastrungenid',
      gitrunid:  'gitrunid',
      statusinfo:  'statusinfo',
    },
      {
        servicename: 'service 1',
        lastbuildstatus: 'lastbuildstatus',
        referenceName:  'referenceName',
        apptype:  'apptype',
        serviceuuid:  'serviceuuid',
        lastrungenerator:  'lastrungenerator',
        lastrungenid:  'lastrungenid',
        gitrunid:  'gitrunid',
        statusinfo:  'statusinfo',
      },
      {
        servicename: 'service 1',
        lastbuildstatus: 'lastbuildstatus',
        referenceName:  'referenceName',
        apptype:  'apptype',
        serviceuuid:  'serviceuuid',
        lastrungenerator:  'lastrungenerator',
        lastrungenid:  'lastrungenid',
        gitrunid:  'gitrunid',
        statusinfo:  'statusinfo',
      },
      {
        servicename: 'service 1',
        lastbuildstatus: 'lastbuildstatus',
        referenceName:  'referenceName',
        apptype:  'apptype',
        serviceuuid:  'serviceuuid',
        lastrungenerator:  'lastrungenerator',
        lastrungenid:  'lastrungenid',
        gitrunid:  'gitrunid',
        statusinfo:  'statusinfo',
      },
      {
        servicename: 'service 1',
        lastbuildstatus: 'lastbuildstatus',
        referenceName:  'referenceName',
        apptype:  'apptype',
        serviceuuid:  'serviceuuid',
        lastrungenerator:  'lastrungenerator',
        lastrungenid:  'lastrungenid',
        gitrunid:  'gitrunid',
        statusinfo:  'statusinfo',
      },];
    this.dataSource = new MatTableDataSource(this.buildStatusData);
  }
}