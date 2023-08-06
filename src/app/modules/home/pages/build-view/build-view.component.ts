import {ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, Renderer2, ViewChild, ViewEncapsulation} from '@angular/core';
import { IPage } from '@app/shared/models/model/page.model';
import {IDatamodel} from '@shared/models/model/datamodel.model';
import {IProject} from '@shared/models/model/project.model';
import {SelectItem} from 'primeng/api';
import {IMainMenu, MainMenu} from '@shared/models/model/main-menu.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BuiltInPageService} from '@core/projectservices/built-in-page.service';
import {ProjectService} from '@core/projectservices/project.service';
import {ActivatedRoute, Router} from '@angular/router';
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
import {GeneratorComponents, IGenerator} from '@shared/models/model/generator-chain.model';
import {GeneratorChainService} from './generator-chain.service';
import { LoginService } from '@app/core/services/login.services';
import { webSocket } from 'rxjs/webSocket';

@Component({
  selector: 'virtuan-build-view',
  templateUrl: './build-view-new.component.html',
  styleUrls: ['./build-view.component.scss',  '../rulechain/rulechain-page.component.scss'],
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
  @ViewChild('buildNodes') div: ElementRef;
  
  isSaving: boolean;
  isGenerated = false;
  displayedColumns: string[] = [  'servicename','referenceName','lastrungenerator', 'generatortime'];
  columnHeaders = { lastbuildstatus: 'Last build status', servicename: 'Service',referenceName:'Reference Name', lastrungenerator:'Last Generator', statusinfo: 'Status info',  generatortime: 'Last generartor duration',}
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
  generatorsDataList: GeneratorComponents[] = []
  servicesList: any[] = []

  splitPartOneSize = 100;
  splitPartTwoSize = 0;
  splitConsoleSizeOne = 100;
  splitConsoleSizeTwo = 0;
  currentTab = 'build';
  isLoading = true;
  step = 'step1';
  isTabVisible = true;
  selectedExecutionData: any;
  selectedLogData: any;
  selectedStep: number
  bEBuildStatus: string;
  index = 0
  stepperList = [];

  buildGenForm() {
    this.editForm = this.fb.group({
      id: [],
      genType: ['', [Validators.required]],
      selectedServices: []
    });
    this.editForm.get('genType').patchValue('All', {emitEvent: true});
  }
  constructor(
      private router: Router,
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
      private generatorService: GeneratorChainService,
      private cdr: ChangeDetectorRef,
      private loginService: LoginService,
      private renderer: Renderer2
  ) {
    this.typeSelected = 'square-jelly-box';

    // window.addEventListener(
    //   "message",
    //   (event) => {
    //     if (event.origin !== "http://localhost:4200") return;
    //     if(event.data) {
    //       this.addBuildNode(event.data)
    //     }
    //   },
    //   false
    // );
    
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
    this.getGeneratorStatusData();
    this.getServiceGenStatus();
    this.currentTab = 'build';
    this.isLoading = false;
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
    this.isGenerating = true;
   // window.postMessage('Start', "http://localhost:4200")
    this.addBuildNode('Start')
    setTimeout(()=>{
      this.isGenerating = false;
      this.cdr.detectChanges();
    }, 50000);
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
    // window.postMessage('Processing', "http://localhost:4200")
    this.addBuildNode('Processing')
    this.projectService
        .getBuildStatusData()
        .pipe(
            filter((mayBeOk: HttpResponse<IEpicServiceBuildStatus[]>) => mayBeOk.ok),
            map((response: HttpResponse<IEpicServiceBuildStatus[]>) => response.body)
        )
        .subscribe(
            (res: IEpicServiceBuildStatus[]) => {
              this.buildStatusData = res;
              this.loadTabSpace(0)
              this.dataSource = new MatTableDataSource(this.buildStatusData);
              this.cdr.detectChanges();
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
             // this.dataSource.paginator.pageIndex = 1;
             // window.postMessage('Completed', "http://localhost:4200")
             this.addBuildNode('Completed')
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
              this.servicesToGenerate = [];
              this.servicesToGenerate = res;
              this.sourceProperties = this.servicesToGenerate;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }

  getGeneratorStatusData () {
    this.generatorService
        .getGeneratorStatusData()
        .pipe(
            filter((mayBeOk: HttpResponse<any[]>) => mayBeOk.ok),
            map((response: HttpResponse<any[]>) => response.body)
        )
        .subscribe(
            (res: any[]) => {
              this.generatorsDataList = res;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }

  getServiceGenStatus () {
    this.generatorService
        .getServiceGenStatus()
        .pipe(
            filter((mayBeOk: HttpResponse<any[]>) => mayBeOk.ok),
            map((response: HttpResponse<any[]>) => response.body)
        )
        .subscribe(
            (res: any[]) => {
              this.servicesList = res;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }

  logout(){
    this.loginService.logout();
    this.router.navigate(['']);
}

  changeSplit(val) {
    this.currentTab = 'build';
      if(val === 'portal') {
        this.router.navigate([`ui`])    
      } else if (val === 'service') {
        this.router.navigate([`service`])    
      } else if (val === 'design'){
        this.router.navigate([`design`])    
      } else if ( val === 'build') {
        this.router.navigate([`build`])    
      }  
  }

  getGeneratorType(generator) {
    let generatorType = '';
    switch (generator) {
      case 'Resource Generator':
        generatorType = 'virtuan-studio';
        break;
      case 'Skeleton Generator':
        generatorType = 'virtuan-ms-generator';
        break;
      case 'Task UI Generator':
        generatorType = 'virtuan-ui-generator';
        break;
      case 'Rule Generator':
        generatorType = 'virtuan-rule-generator';
        break;
      case 'gRPC Generator':
        generatorType = 'virtuan-grpc-generator';
        break;
      case 'Builder':
        generatorType = 'virtuan-studio-builder';
        break;
      default:
        generatorType = 'other';
    }
    return generatorType;
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

addBuildNode(title) {
  if(this.isGenerating){
    this.index = this.index + 1;
    if(title === 'Completed'){
      const p: HTMLDivElement = this.renderer.createElement('div');
      p.className = 'build-progress-step is-complete'
      p.textContent = title
      p.id = 'step'+ this.index;
      this.renderer.appendChild(this.div.nativeElement, p)
      this.next(0)
    } else {
      const p: HTMLDivElement = this.renderer.createElement('div');
      p.className = 'build-progress-step'
      p.textContent = title
      p.id = 'step'+ this.index;
      this.renderer.appendChild(this.div.nativeElement, p)
      this.stepperList.push(document.getElementById(p.id) as HTMLElement)
      this.next(p.id)
    }
  }
}

  //build-progress bar action
  next(step) {
    if(step !== 0){
      this.stepperList.forEach((item)=> {
        if(step === item.id){
            item.classList.add('is-active');
        } else {
            item.classList.remove('is-active');
            item.classList.add('is-complete');
        }
      })
    } else {
      this.stepperList.forEach((item)=> {
        if(item.classList.contains('is-active')){
            item.classList.remove('is-active');
            item.classList.add('is-complete');
        }
      })
    }
  }

  loadTabSpace(index: number){
    this.selectedStep = index;
    this.selectedLogData = this.buildStatusData[index].lastbuildid;
    this.selectedExecutionData = this.buildStatusData[index].statusinfo;
  }

  getStepBackgroundColor(index: number){
    if(this.selectedStep === index) {
      return `#89b8d7`;
    } else {
      return '';
    }
  }
}
