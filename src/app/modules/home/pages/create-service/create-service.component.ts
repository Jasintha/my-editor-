import {Component, Inject, OnInit} from '@angular/core';
import {ISolution} from '@shared/models/model/solution.model';
import {IProjecttemplate} from '@shared/models/model/projecttemplate.model';
import {IApptypes} from '@shared/models/model/apptypes.model';
import {IServiceAccount} from '@shared/models/model/service-account.model';
import {SelectItem} from 'primeng/api';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProjectService} from '@core/projectservices/project.service';
import {ApptypesService} from '@core/projectservices/apptypes.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ServiceAccountService} from '@core/projectservices/service-account.service';
import {SolutionService} from '@core/projectservices/solution.service';
import {ProjecttemplateService} from '@core/projectservices/projecttemplate.service';
import {Observable} from 'rxjs';
import {IProject, Project} from '@shared/models/model/project.model';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {filter, map} from 'rxjs/operators';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {EventManagerService} from '@shared/events/event.type';
import {NgxSpinnerService} from 'ngx-spinner';
interface Item {
  value: any;
  label: string;
}
@Component({
  selector: 'virtuan-create-service',
  templateUrl: './create-service.component.html',
  styleUrls: ['./create-service.component.scss']
})
export class CreateServiceComponent implements OnInit {

  isSaving: boolean;
  solutionId: number;
  solution: ISolution;
  solutions: ISolution[];
  tempateItems: Item[];
  projecttemplates: IProjecttemplate[];
  projectKeys: string[];
  projectKeyItems: Item[];
  apptypes: IApptypes[];
  accTypeItems: Item[];
  allAccounts: IServiceAccount[];
  dockerAccTypeItems: Item[];

  projectTypes: SelectItem[] = [
    { label: 'Task UI', value: 'task.ui' },
    { label: 'Microservice', value: 'microservice' },
    { label: 'Design Project', value: 'design' },
  ];

  templateItems: SelectItem[] = [
    { label: 'Persistent', value: 'persistent' },
    { label: 'CQRS Pattern', value: 'cqrs' },
    { label: 'Sidecar', value: 'sidecar' },
    { label: 'Sidecar Proxy', value: 'sidecar_proxy' },
  ];
  eventSourceItems: SelectItem[] = [{ label: 'NATS', value: 'nats' }];
  dbItems: SelectItem[] = [
    { label: 'Relational Database (MySQL, PostgreSQL)', value: 'RDB' },
    { label: 'NoSQL Database (MongoDB)', value: 'NOSQL' },
  ];
  projectionItems: SelectItem[] = [
    { label: 'Event Based', value: 'event' },
    { label: 'Operation Based', value: 'operation' },
  ];
  projectTypeItems: SelectItem[] = [
    { label: 'Shared', value: 'PUBLIC' },
    { label: 'PRIVATE', value: 'PRIVATE' },
  ];
  apptype: string;
  editForm: FormGroup;
  cqrs: boolean;
  statefull: boolean;
  publicTypeAvailability = true;
  typeSelected: string;

  buildForm() {
    this.editForm = this.fb.group({
      id: '',
      appType: '',
      appCategory: ['microservice'],
      name: ['', [Validators.required]],
      namespace: ['', [Validators.required]],
      version: ['', [Validators.required]],
      description: [],
      solution: [],
      apptype: [],
      template: '',
      // internalAcc: '',
      projecttype: '',
      multiTenancy: false,
      // externalAcc: '',
      // templateKey: [],
      // eventSource: [],
      // isCqrsEnabled: false,
      // commandDb: [],
      // queryDb: [],
      // projectDb: [],
      // projection: [],
      projectType: '',
      contextRoot: '/',
      // dockerAcc: '',
      // enableSecurity: false,
      // statefulService: false,
      // enableEventSourcing: false
    });
  }

  setProjectScopeValidators() {
    this.editForm.get('projectType').valueChanges.subscribe(selectedProjectType => {
      if (selectedProjectType === 'PUBLIC') {
        this.editForm.get('externalAcc').setValidators([Validators.required]);
        this.editForm.get('externalAcc').updateValueAndValidity();
      } else {
        this.editForm.get('externalAcc').clearValidators();
        this.editForm.get('externalAcc').updateValueAndValidity();
      }
    });
  }

  constructor(
      protected serviceAccountService: ServiceAccountService,
      protected projectService: ProjectService,
      protected solutionService: SolutionService,
      protected apptypesService: ApptypesService,
      protected projecttemplateService: ProjecttemplateService,
      protected activatedRoute: ActivatedRoute,
      private fb: FormBuilder,
      // private socket: WebsocketService,
      private router: Router,
      public dialogRef: MatDialogRef<CreateServiceComponent>,
      @Inject(MAT_DIALOG_DATA)  public data: any,
      protected eventManager: EventManagerService,
      private spinnerService: NgxSpinnerService,
  ) {
    this.typeSelected = 'square-jelly-box';
  }

  ngOnInit() {
    this.spinnerService.hide();
    this.buildForm();
    this.apptype = 'microservice';
    // this.setProjectScopeValidators();
    this.isSaving = false;
    this.tempateItems = [];
    this.projectKeyItems = [];
    this.allAccounts = [];
    this.accTypeItems = [];
    this.dockerAccTypeItems = [];
    this.serviceAccountService
        .query()
        .pipe(
            filter((res: HttpResponse<IServiceAccount[]>) => res.ok),
            map((res: HttpResponse<IServiceAccount[]>) => res.body)
        )
        .subscribe(
            (res: IServiceAccount[]) => {
              this.allAccounts = res;
              this.loadAccs();
              this.loadProject();
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }

  onTypeChange() {
    this.apptype = this.editForm.get('appCategory').value;
    if (this.apptype === 'design') {
      // this.editForm.get('internalAcc').clearValidators();
      // this.editForm.get('internalAcc').updateValueAndValidity();
      // this.editForm.get('dockerAcc').clearValidators();
      // this.editForm.get('dockerAcc').updateValueAndValidity();
    } else {
      // this.editForm.get('internalAcc').setValidators([Validators.required]);
      // this.editForm.get('internalAcc').updateValueAndValidity();
      // this.editForm.get('dockerAcc').setValidators([Validators.required]);
      // this.editForm.get('dockerAcc').updateValueAndValidity();
    }
  }

  clear() {
    //this.activeModal.dismiss('cancel');
  }
  loadAccs() {
    if (this.allAccounts) {
      for (let i = 0; i < this.allAccounts.length; i++) {
        if (this.allAccounts[i].accountType === 'GITHUB') {
          const label: string = this.allAccounts[i].name + ' (Base URL - ' + this.allAccounts[i].gitAccount.baseURL + ')';
          this.accTypeItems.push({ label: label, value: this.allAccounts[i].uuid });
        } else if (this.allAccounts[i].accountType === 'DOCKERHUB') {
          const label: string = this.allAccounts[i].name + ' (User - ' + this.allAccounts[i].dockerAccount.username + ')';
          this.dockerAccTypeItems.push({ label: label, value: this.allAccounts[i].uuid });
        }
      }
    }
  }

  loadProjectKeys() {
    for (let i = 0; i < this.projectKeys.length; i++) {
      this.projectKeyItems.push({ label: this.projectKeys[i], value: this.projectKeys[i] });
    }
  }

  loadProject() {
    this.activatedRoute.data.subscribe(({ project }) => {
      this.updateForm(project);
    });
  }

  loadProjectTemplates() {
    for (let i = 0; i < this.projecttemplates.length; i++) {
      const dropdownLabel = this.projecttemplates[i].name;
      this.tempateItems.push({ label: dropdownLabel, value: this.projecttemplates[i] });
    }
  }

  updateForm(project: IProject) {
    let projectType: string = project.projecttype;
    // let enableSecurity: boolean = project.enableSecurity;
    // let statefulService: boolean = project.statefulService;
    let contextRoot: string = project.contextRoot;

    if (project.projectUuid === null || project.projectUuid == undefined || project.projectUuid == '') {
      projectType = 'PRIVATE';
      if (this.apptype) {
        project.apptypesID = this.apptype;
      }
      // enableSecurity = false;
      // statefulService = true;
      contextRoot = '/';
    }
    this.editForm.patchValue({
      id: project.projectUuid,
      name: project.displayName,
      namespace: project.namespace,
      contextRoot: contextRoot,
      version: project.version,
      description: project.description,
      // solution: project.solution,
      template: project.template,
      apptype: project.apptypesID,
      // eventSource: project.eventSource,
      // isCqrsEnabled: project.isCqrsEnabled,
      // commandDb: project.commandDb,
      // queryDb: project.queryDb,
      // projectDb: project.projectDb,
      projectType: projectType,
      // internalAcc: project.interalRepoAccUUID,
      // dockerAcc: project.dockerHubAccUUID,
      multiTenancy: project.multiTenancy,
      // externalAcc: project.externalRepoAccUUID
      // projection: project.projection,
      // enableSecurity: enableSecurity,
      // statefulService: statefulService,
      // enableEventSourcing: project.enableEventSourcing
    });
  }

  previousState() {
    this.dialogRef.close();
  }

  save() {
    this.spinnerService.show();
    this.isSaving = true;
    const project = this.createFromForm();
    if (this.editForm.valid) {
      if (project.projectUuid) {
        this.subscribeToSaveResponse(this.projectService.update(project), 'update');
      } else {
        this.subscribeToSaveResponse(this.projectService.create(project), 'save');
      }
    } else {
    }
  }

  private createFromForm(): IProject {
    const apptype = this.apptype;
    const projecttype = this.editForm.get(['projectType']).value;
    // let externalAccUuid = '';
    // if (projecttype == 'PUBLIC') {
    // externalAccUuid = this.editForm.get(['externalAcc']).value;
    // }

    if (apptype && apptype === 'microservice') {
      // let isCqrsEnabled = this.editForm.get(['isCqrsEnabled']).value;
      // let statefulService: boolean = this.editForm.get(['statefulService']).value;

      // let commandDb = '';
      // let queryDb = '';
      // let projectDb = '';

      // if (statefulService) {
      //  if (isCqrsEnabled) {
      // commandDb = this.editForm.get(['commandDb']).value;
      // queryDb = this.editForm.get(['queryDb']).value;
      //  } else {
      // projectDb = this.editForm.get(['projectDb']).value;
      //  }
      // } else {
      //  isCqrsEnabled = false;
      // }

      return {
        ...new Project(),
        projectUuid: this.editForm.get(['id']).value,
        displayName: this.editForm.get(['name']).value,
        namespace: this.editForm.get(['namespace']).value,
        version: this.editForm.get(['version']).value,
        description: this.editForm.get(['description']).value,
        //solution: this.solution,
        apptypesID: apptype,
        template: this.editForm.get(['template']).value,
        //  templateKey: this.editForm.get(['templateKey']).value,
        // eventSource: this.editForm.get(['eventSource']).value,
        // isCqrsEnabled: isCqrsEnabled,
        // commandDb: commandDb,
        // queryDb: queryDb,
        // projectDb: projectDb,
        projecttype: this.editForm.get(['projectType']).value,
        // interalRepoAccUUID: this.editForm.get(['internalAcc']).value,
        // dockerHubAccUUID: this.editForm.get(['dockerAcc']).value,
        multiTenancy: this.editForm.get(['multiTenancy']).value,
        // externalRepoAccUUID: externalAccUuid
        // projection: this.editForm.get(['projection']).value,
        // enableSecurity: this.editForm.get(['enableSecurity']).value,
        // statefulService: statefulService,
        // enableEventSourcing: this.editForm.get(['enableEventSourcing']).value
      };
    } else {
      let enableJWT: boolean = false;
      let contextRoot = '';

      if (apptype) {
        if (apptype === 'virtuan.webapp-v2') {
          enableJWT = true;
        } else if (apptype === 'task.ui') {
          let contextRootStr = this.editForm.get(['contextRoot']).value;
          if (contextRoot) {
            const contextRootStart: boolean = contextRootStr.startsWith('/');
            if (!contextRootStart) {
              contextRootStr = '/' + contextRootStr;
            }
            const contextRootEnd: boolean = contextRootStr.endsWith('/');
            if (!contextRootEnd) {
              contextRootStr = contextRootStr + '/';
            }

            contextRoot = contextRootStr;
          } else {
            contextRoot = '/';
          }
        }
      }
      return {
        ...new Project(),
        projectUuid: this.editForm.get(['id']).value,
        displayName: this.editForm.get(['name']).value,
        namespace: this.editForm.get(['namespace']).value,
        contextRoot: contextRoot,
        version: this.editForm.get(['version']).value,
        description: this.editForm.get(['description']).value,
        // solution: this.solution,
        apptypesID: apptype,
        template: '',
        projecttype: this.editForm.get(['projectType']).value,
        // interalRepoAccUUID: this.editForm.get(['internalAcc']).value,
        // dockerHubAccUUID: this.editForm.get(['dockerAcc']).value,
        // externalRepoAccUUID: externalAccUuid
        // enableSecurity: enableJWT
        //  templateKey: this.editForm.get(['templateKey']).value
      };
    }
  }

  onEnterName(event) {
    this.editForm.patchValue({
      contextRoot: '/' + this.editForm.get(['name']).value.toLowerCase() + '/',
    });
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IProject>>, type: string) {
    result.subscribe(
        (res: any) => this.onSaveSuccess(res, type),
        () => this.onSaveError()
    );
  }

  protected onSaveSuccess(res, type) {
    this.spinnerService.hide();
    this.isSaving = false;
    this.eventManager.dispatch(
        new AppEvent(EventTypes.editorTreeListModification, {
          name: 'editorTreeListModification',
          content: 'Add an Model',
        })
    );
    this.previousState();
    // if (type === 'save') {
    //   let project: IProject = res.body;
    //   this.socket.send(this.projectService.getProjectUUID(project));
    // }
    // const url: string = '/project';
    // this.router.navigate([url]);
  }

  protected onSaveError() {
    this.spinnerService.hide();
    // this.spinnerService.hide();
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }

}
