import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { SelectItem } from "primeng/api";
import { IMainMenu, MainMenu } from "@shared/models/model/main-menu.model";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BuiltInPageService } from "@core/projectservices/built-in-page.service";
import { ProjectService } from "@core/projectservices/project.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MainMenuService } from "@core/projectservices/main-menu.service";
import { CustomPageService } from "@core/projectservices/custom-page.service";
import { HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { filter, map } from "rxjs/operators";
import { Observable } from "rxjs";
import { IHybridfunction } from "@shared/models/model/hybridfunction.model";
import { IApi } from "@shared/models/model/microservice-api.model";
import { EventManagerService } from "@shared/events/event.type";
import { AppEvent } from "@shared/events/app.event.class";
import { EventTypes } from "@shared/events/event.queue";
import { NgxSpinnerService } from "ngx-spinner";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { IFormField } from "@shared/models/model/form-field.model";
import { IEpicService } from "@shared/models/model/epic-service.model";
import {
  EpicServiceGenReq,
  IEpicServiceBuildStatus,
} from "@shared/models/model/epic-service-build-status.model";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { WebsocketService } from "@core/tracker/websocket.service";
import { BreakpointTrackerService } from "@core/tracker/breakpoint.service";
import {
  GeneratorComponents,
  IGenerator,
} from "@shared/models/model/generator-chain.model";
import { LoginService } from "@app/core/services/login.services";
import { GeneratorChainService } from "../../build-view/generator-chain.service";

@Component({
  selector: "uib-build-page",
  templateUrl: "./uib-build.component.html",
  styleUrls: [
    "./uib-build.component.scss",
    "../../rulechain/rulechain-page.component.scss",
  ],
})
export class UibBuildPageComponent implements OnInit {
  @ViewChild("buildNodes") div: ElementRef;

  isSaving: boolean;
  columnHeaders = {
    lastbuildstatus: "Last build status",
    servicename: "Service",
    referenceName: "Reference Name",
    lastrungenerator: "Last Generator",
    statusinfo: "Status info",
    generatortime: "Last generartor duration",
  };
  servicesToGenerate: IEpicService[] = [];
  buildStatusData: IEpicServiceBuildStatus[] = [];
  isBuildLogAvailable: boolean;
  expandedElement: IEpicServiceBuildStatus | null;
  isGenerating = false;
  reload: boolean;
  theme: string = "vs-dark";
  editorOptions: any = {
    language: "json",
    readOnly: true,
    renderLineHighlight: "none",
  };
  code: string = "";
  generatorList: { [key: number]: string } = {};
  generatorChain: IGenerator[];
  genTypes: SelectItem[] = [
    { label: "All", value: "All" },
    { label: "Custom", value: "Custom" },
  ];
  editForm: FormGroup;
  sourceProperties: IEpicService[] = [];
  targetProperties: IEpicService[] = [];
  generatorsDataList: GeneratorComponents[] = [];
  servicesList: any[] = [];

  currentTab = "uib-build";
  isLoading = true;
  step = "step1";
  isTabVisible = true;
  selectedExecutionData: any;
  selectedLogData: any;
  selectedStep: number;
  bEBuildStatus: string;
  index = 0;
  stepperList = [];

  buildGenForm() {
    this.editForm = this.fb.group({
      id: [],
      genType: ["", [Validators.required]],
      selectedServices: [],
    });
    this.editForm.get("genType").patchValue("All", { emitEvent: true });
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
    private generatorService: GeneratorChainService,
    private cdr: ChangeDetectorRef,
    private loginService: LoginService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.spinnerService.hide();
    this.buildGenForm();
    this.sourceProperties = [];
    this.targetProperties = [];
    this.buildStatusData = [];
    this.getBuildstatusData();
    this.loadServicesForGenerate();
    this.getGeneratorStatusData();
    this.getServiceGenStatus();
    this.currentTab = "uib-build";
    this.isLoading = false;
  }

  generate() {
    this.spinnerService.show();
    this.isSaving = true;
    this.isGenerating = true;
    // if(this.isGenerating && this.div.nativeElement){
    //   this.addBuildNode('Starting')
    // }
    setTimeout(() => {
      this.isGenerating = false;
      this.cdr.detectChanges();
    }, 50000);
    const genReq = this.createFromForm();
    this.getBuildstatusData();
    this.loadGenLogs();
    if (genReq.services.length > 0) {
      this.subscribeToSaveResponse(
        this.projectService.generateServices(genReq)
      );
    }
  }

  private createFromForm(): EpicServiceGenReq {
    const servicesIdList = [];
    const servicesToGenerate = this.editForm.get(["selectedServices"]).value;
    if (this.editForm.get(["selectedServices"]).value === "All") {
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

  getBuildstatusData() {
    // if(this.isGenerating && this.div.nativeElement){
    //    this.addBuildNode('Processing')
    // }
    this.projectService
      .getBuildStatusData()
      .pipe(
        filter(
          (mayBeOk: HttpResponse<IEpicServiceBuildStatus[]>) => mayBeOk.ok
        ),
        map(
          (response: HttpResponse<IEpicServiceBuildStatus[]>) => response.body
        )
      )
      .subscribe(
        (res: IEpicServiceBuildStatus[]) => {
          this.buildStatusData = res;
          this.loadTabSpace(0);
          this.cdr.detectChanges();
          this.isBuildLogAvailable = true;
        },
        (res: HttpErrorResponse) => this.onError(res.message)
      );
  }

  protected subscribeToSaveResponse(
    result: Observable<HttpResponse<IMainMenu>>
  ) {
    result.subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    this.spinnerService.hide();
    this.isSaving = false;
  }

  protected onSaveError() {
    this.spinnerService.hide();
    // this.spinnerService.hide();
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    console.log(errorMessage);
  }

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

  getGeneratorStatusData() {
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

  getServiceGenStatus() {
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

  logout() {
    this.loginService.logout();
    this.router.navigate([""]);
  }

  changeSplit(val) {
    this.currentTab = val;
    if (val === "dashboard") {
      this.router.navigate([`dashboard`]);
    } else if (val === "application") {
      this.router.navigate([`application`]);
    } else if (val === "uib-editor") {
      this.router.navigate([`uib-editor`]);
    } else if (val === "uib-build") {
      this.router.navigate([`uib-build`]);
    }
  }

  loadGenLogs() {
    this.socket.getEventListener().subscribe((event) => {
      if (event.type === "message") {
        const topic = event.data.topic;
        if (topic === "generator") {
          const data = event.data.content;

          let projectUUID = "";
          let status = "";
          let time = "";
          let position = -1;

          const allKeyValuePairs = data.split(",");
          if (allKeyValuePairs) {
            allKeyValuePairs.forEach((keyval) => {
              const keyAndValArr = keyval.split("=", 2);
              let key = "";
              let val = "";

              if (keyAndValArr) {
                for (let i = 0; i < keyAndValArr.length; i++) {
                  if (i === 0) {
                    key = keyAndValArr[i];
                  } else {
                    val = keyAndValArr[i];
                  }
                }
              }

              if (key === "projectuuid") {
                projectUUID = val;
              } else if (key === "status") {
                status = val;
              } else if (key === "time") {
                time = val;
              } else if (key === "position") {
                position = +val;
              }
            });
          }

          // if (uuid === projectUUID) {
          if (status) {
            if (status.trim() === "didnot") {
              if (this.code !== "") {
                this.code = this.code + ",\n";
              }
              this.code =
                this.code +
                '{"status": "Error", "detail": "Generation failed at ' +
                this.generatorList[position] +
                '"}';
            } else if (status.trim() === "done") {
              if (this.code !== "") {
                this.code = this.code + ",\n";
              }
              this.code =
                this.code +
                '{"status": "Success", "detail": "Generation successful at ' +
                this.generatorList[position] +
                '"}';
            } else if (status.trim() === "done") {
              if (this.code !== "") {
                this.code = this.code + ",\n";
              }
              this.code =
                this.code +
                '{"status": "In progress", "detail": "Generation started at ' +
                this.generatorList[position] +
                '"}';
            }
          }
        }
      }
      // if(this.isGenerating && this.div.nativeElement){
      //   this.addBuildNode('Completed')
      // }
    });
  }

  addBuildNode(title) {
    if (this.isGenerating) {
      this.index = this.index + 1;
      if (title === "Completed") {
        const p: HTMLDivElement = this.renderer.createElement("div");
        p.className = "build-progress-step is-complete";
        p.textContent = title;
        p.id = "step" + this.index;
        this.renderer.appendChild(this.div.nativeElement, p);
        this.next(0);
      } else {
        const p: HTMLDivElement = this.renderer.createElement("div");
        p.className = "build-progress-step";
        p.textContent = title;
        p.id = "step" + this.index;
        this.renderer.appendChild(this.div.nativeElement, p);
        this.stepperList.push(document.getElementById(p.id) as HTMLElement);
        this.next(p.id);
      }
    }
  }

  //build-progress bar action
  next(step) {
    if (step !== 0) {
      this.stepperList.forEach((item) => {
        if (step === item.id) {
          item.classList.add("is-active");
        } else {
          item.classList.remove("is-active");
          item.classList.add("is-complete");
        }
      });
    } else {
      this.stepperList.forEach((item) => {
        if (item.classList.contains("is-active")) {
          item.classList.remove("is-active");
          item.classList.add("is-complete");
        }
      });
    }
  }

  loadTabSpace(index: number) {
    this.selectedStep = index;
    this.selectedLogData = this.buildStatusData[index].lastbuildid;
    this.selectedExecutionData = this.buildStatusData[index].statusinfo;
  }

  getStepBackgroundColor(index: number) {
    if (this.selectedStep === index) {
      return `#89b8d7`;
    } else {
      return "";
    }
  }
}
