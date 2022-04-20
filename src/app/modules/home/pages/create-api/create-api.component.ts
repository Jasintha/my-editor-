import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {ActivatedRoute} from '@angular/router';
import { IProject } from '@app/shared/models/model/project.model';
import {Command, ICommand} from '@shared/models/model/command.model';
import {IQuery, Query} from '@shared/models/model/query.model';
import {
  APIInput,
  APIInputType,
  APIParamType,
  IAPIInput,
  IWorkflowMapping,
  WorkflowMapping
} from '@shared/models/model/api-input.model';
import {IDatamodel} from '@shared/models/model/datamodel.model';
import {ICustomObject} from '@shared/models/model/custom-object.model';
import { IAggregate } from '@app/shared/models/model/aggregate.model';
import {IEvent} from '@shared/models/model/microservice-event.model';
import {IViewmodel} from '@shared/models/model/viewmodel.model';
import {ISubrule} from '@shared/models/model/subrule.model';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {filter, map} from 'rxjs/operators';
import { IApi } from '@app/shared/models/model/microservice-api.model';
import {Api} from '@shared/models/model/microservice-api.model';
import {Observable} from 'rxjs';
import {InputPropertyService} from '@core/projectservices/input-property.service';
import {ApiService} from '@core/projectservices/api.service';
import {CommandService} from '@core/projectservices/microservice-command.service';
import {ProjectService} from '@core/projectservices/project.service';
import {QueryService} from '@core/projectservices/microservice-query.service';
interface Item {
  value: any;
  label: string;
}
@Component({
  selector: 'virtuan-create-api',
  templateUrl: './create-api.component.html',
  styleUrls: ['./create-api.component.scss']
})
export class CreateApiComponent implements OnInit {

  form: FormGroup;
  selectedOption = 'REST';
  selectedApiType = 'API';

  @Output() isVisibleEvent = new EventEmitter<boolean>();
  isSaving: boolean;
  project: IProject;
  currentCommand: ICommand;
  currentQuery: IQuery;
  currentApi: IApi;
  items: Item[];
  returnItems: Item[];
  selectedAPIInputs: IAPIInput[];
  datamodels: IDatamodel[] = [];
  customObjects: ICustomObject[];
  aggregates: IAggregate[];
  apiParams: APIInput[];
  aggregateItems: Item[];
  viewmodelItems: Item[];
  events: IEvent[];
  eventItems: Item[];
  subruleItems: Item[];
  editType: string;
  apiStyle: string;
  apiID: string;
  viewmodels: IViewmodel[];
  apitypeItems: Item[];
  allSubRules: ISubrule[];
  workflowInputItems: Item[];
  mappedApiInputItems: Item[];
  worlflowMappings: IWorkflowMapping[];
  projectUid: string;

  apiStyleTypeItems: Item[] = [
    { label: 'REST', value: 'REST' },
    { label: 'GRPC', value: 'GRPC' },
  ];

  displayedColumns: string[] = ['name', 'datatype', 'param', 'actions'];
  displayedColumnsWorkflow: string[] = ['workflowinput', 'apiinput', 'actions'];
  ELEMENT_DATA: APIInput[] = [];
  dataSource = new MatTableDataSource(this.ELEMENT_DATA);

  WORKFLOW_MAP: WorkflowMapping[] = [];
  workFlowSource = new MatTableDataSource(this.WORKFLOW_MAP);

  grpcMethodItems: Item[] = [
    { label: 'Unary', value: 'unary' },
    { label: 'Server Side Streaming', value: 'server_side_streaming' },
    { label: 'Client Side Streaming', value: 'client_side_streaming' },
    { label: 'Bidirectional Streaming', value: 'bidirectional_streaming' },
  ];
  typeItems: Item[] = [
    { label: 'Create', value: 'CREATE' },
    { label: 'Update', value: 'UPDATE' },
  ];
  crudItems: Item[] = [
    { label: 'CREATE', value: 'CREATE' },
    { label: 'UPDATE', value: 'UPDATE' },
    { label: 'DELETE', value: 'DELETE' },
    { label: 'FIND', value: 'FIND' },
  ];
  paramitems: Item[] = [
    { label: 'Query', value: 'QUERY' },
    { label: 'Path', value: 'PATH' },
  ];
  paramDataTypeItems: Item[] = [
    { label: 'TEXT', value: 'TEXT' },
    { label: 'NUMBER', value: 'NUMBER' },
    { label: 'FLOAT', value: 'FLOAT' },
    { label: 'TRUE_OR_FALSE', value: 'TRUE_OR_FALSE' },
    { label: 'DATE', value: 'DATE' },
  ];

  builApidForm() {
    this.form = this.fb.group({
      id: '',
      selectedAPIInputs: [],
      name: ['', [Validators.required]],
      operation: [],
      returnRecordType: [],
      returnObj: [],
      paramType: [],
      paramName: [],
      paramDataType: [],
      apitype: '',
      apiStyleType: ['', [Validators.required]],
      grpcMethod: '',
      description: [],
      operationType: [],
      selectedEvent: [],
      selectedSubrule: [],
      selectedViewmodel: [],
      createWorkflow: false,
      enableSecurity: false,
      resourcePath: '',
      workflowInput: [],
      mappedApiInput: [],
    });
  }

  setApiCategoryValidators() {
    this.form.get('apiStyleType').valueChanges.subscribe(apiStyleType => {
      if (apiStyleType === 'REST') {
        this.form.get('grpcMethod').clearValidators();
        this.form.get('grpcMethod').updateValueAndValidity();

        this.form.get('apitype').setValidators([Validators.required]);
        this.form.get('apitype').updateValueAndValidity();

        this.form.get('resourcePath').setValidators([Validators.required]);
        this.form.get('resourcePath').updateValueAndValidity();
      } else if (apiStyleType === 'GRPC') {
        this.form.get('apitype').clearValidators();
        this.form.get('apitype').updateValueAndValidity();

        this.form.get('operationType').clearValidators();
        this.form.get('operationType').updateValueAndValidity();

        this.form.get('selectedEvent').clearValidators();
        this.form.get('selectedEvent').updateValueAndValidity();

        this.form.get('selectedViewmodel').clearValidators();
        this.form.get('selectedViewmodel').updateValueAndValidity();

        this.form.get('operation').clearValidators();
        this.form.get('operation').updateValueAndValidity();

        this.form.get('resourcePath').clearValidators();
        this.form.get('resourcePath').updateValueAndValidity();

        this.form.get('selectedAPIInputs').setValidators([Validators.required]);
        this.form.get('selectedAPIInputs').updateValueAndValidity();

        this.form.get('grpcMethod').setValidators([Validators.required]);
        this.form.get('grpcMethod').updateValueAndValidity();
      }
    });

    this.form.get('apitype').valueChanges.subscribe(apitype => {
      if (apitype === 'API') {
        this.form.get('operationType').clearValidators();
        this.form.get('operationType').updateValueAndValidity();

        this.form.get('selectedEvent').clearValidators();
        this.form.get('selectedEvent').updateValueAndValidity();

        this.form.get('selectedViewmodel').clearValidators();
        this.form.get('selectedViewmodel').updateValueAndValidity();

        this.form.get('operation').setValidators([Validators.required]);
        this.form.get('operation').updateValueAndValidity();
      }

      if (apitype === 'COMMAND') {
        this.form.get('operationType').setValidators([Validators.required]);
        this.form.get('operationType').updateValueAndValidity();

        this.form.get('selectedEvent').setValidators([Validators.required]);
        this.form.get('selectedEvent').updateValueAndValidity();

        this.form.get('selectedViewmodel').clearValidators();
        this.form.get('selectedViewmodel').updateValueAndValidity();

        this.form.get('operation').clearValidators();
        this.form.get('operation').updateValueAndValidity();

        this.form.get('selectedAPIInputs').clearValidators();
        this.form.get('selectedAPIInputs').updateValueAndValidity();
      }

      if (apitype === 'QUERY') {
        this.form.get('operationType').clearValidators();
        this.form.get('operationType').updateValueAndValidity();

        this.form.get('selectedEvent').clearValidators();
        this.form.get('selectedEvent').updateValueAndValidity();

        this.form.get('selectedViewmodel').setValidators([Validators.required]);
        this.form.get('selectedViewmodel').updateValueAndValidity();

        this.form.get('operation').clearValidators();
        this.form.get('operation').updateValueAndValidity();

        this.form.get('selectedAPIInputs').clearValidators();
        this.form.get('selectedAPIInputs').updateValueAndValidity();
      }

      if (apitype === 'FILE_UPLOAD') {
        this.form.get('operationType').clearValidators();
        this.form.get('operationType').updateValueAndValidity();

        this.form.get('selectedEvent').clearValidators();
        this.form.get('selectedEvent').updateValueAndValidity();

        this.form.get('selectedViewmodel').clearValidators();
        this.form.get('selectedViewmodel').updateValueAndValidity();

        this.form.get('operation').clearValidators();
        this.form.get('operation').updateValueAndValidity();

        this.form.get('selectedAPIInputs').clearValidators();
        this.form.get('selectedAPIInputs').updateValueAndValidity();
      }

      if (apitype === 'FILE_DOWNLOAD') {
        this.form.get('operationType').clearValidators();
        this.form.get('operationType').updateValueAndValidity();

        this.form.get('selectedEvent').clearValidators();
        this.form.get('selectedEvent').updateValueAndValidity();

        this.form.get('selectedViewmodel').clearValidators();
        this.form.get('selectedViewmodel').updateValueAndValidity();

        this.form.get('operation').clearValidators();
        this.form.get('operation').updateValueAndValidity();

        this.form.get('selectedAPIInputs').clearValidators();
        this.form.get('selectedAPIInputs').updateValueAndValidity();
      }
    });

    this.form.get('operation').valueChanges.subscribe(selectedOperation => {
      if (selectedOperation === 'CREATE' || selectedOperation === 'UPDATE') {
        this.form.get('selectedAPIInputs').setValidators([Validators.required]);
        this.form.get('selectedAPIInputs').updateValueAndValidity();
      } else {
        this.form.get('selectedAPIInputs').clearValidators();
        this.form.get('selectedAPIInputs').updateValueAndValidity();
      }
    });
  }
  constructor(
      protected inputPropertyService: InputPropertyService,
      protected apiService: ApiService,
      protected activatedRoute: ActivatedRoute,
      private fb: FormBuilder,
      protected queryService: QueryService,
      protected commandService: CommandService,
      protected projectService: ProjectService,
  ) {
  }

  ngOnInit() {
    this.getApiData();
  }

  getApiData() {
    this.builApidForm();
    this.setApiCategoryValidators();
    this.onReturnObjChangeQuery();
    this.isSaving = false;
    this.items = [];
    this.returnItems = [];
    this.apiParams = [];
    this.eventItems = [];
    this.subruleItems = [];
    this.workflowInputItems = [];
    this.mappedApiInputItems = [];
    this.worlflowMappings = [];
    this.viewmodelItems = [];
    this.aggregateItems = [];
    this.apitypeItems = [];
    this.addPrimitivesForReturnSelect();
    this.activatedRoute.params.subscribe(params => {
      this.apiID = params.id;
      this.projectUid = params.projectUid;
      this.editType = params.type;
      this.apiStyle = params.apiStyle;
      if (this.projectUid) {
        this.projectService
            .findWithModelEventsAndSubrules(this.projectUid)
            .pipe(
                filter((mayBeOk: HttpResponse<IProject>) => mayBeOk.ok),
                map((response: HttpResponse<IProject>) => response.body)
            )
            .subscribe(
                (res: IProject) => {
                  this.project = res;
                  // this.projectSecurity = this.project.enableSecurity;
                  if (this.project.template === 'cqrs') {
                    this.apitypeItems = [
                      { label: 'CQRS Command API', value: 'COMMAND' },
                      { label: 'CQRS Query API', value: 'QUERY' },
                      { label: 'Default API', value: 'API' },
                      { label: 'File Upload API', value: 'FILE_UPLOAD' },
                      { label: 'File Download API', value: 'FILE_DOWNLOAD' },
                    ];
                  } else {
                    this.apitypeItems = [
                      { label: 'Default API', value: 'API' },
                      { label: 'File Upload API', value: 'FILE_UPLOAD' },
                      { label: 'File Download API', value: 'FILE_DOWNLOAD' },
                    ];
                  }
                  this.datamodels = this.project.datamodels;
                  this.customObjects = this.project.customObjects;
                  this.aggregates = this.project.aggregates;
                  this.events = this.project.events;
                  this.viewmodels = this.project.viewmodels;
                  this.allSubRules = this.project.subRulevms;
                  if (this.aggregates) {
                    this.loadAggregates();
                  }
                  if (this.viewmodels) {
                    this.loadViewmodels();
                  }
                  if (this.events) {
                    this.loadEvents();
                  }

                  if (this.allSubRules) {
                    this.loadSubrules();
                  }

                  this.loadUpdateForm();
                  // this.loadEntities();
                  // this.loadCustomObjects();
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
      }
    });
  }

  onReturnObjChange() {
    const returnObjType = this.form.get(['returnRecordType']).value;
    if (returnObjType !== 's' && returnObjType !== 'm') {
      this.form.get('returnRecordType').patchValue('s', { emitEvent: true });
    }
  }

  onReturnObjChangeQuery() {
    this.form.get('apitype').valueChanges.subscribe(apitype => {
      if (apitype === 'QUERY') {
        this.onReturnObjChange();
      }
    });
  }

  workflowMapItemsOnOperationChange(formcontrol: string) {
    this.mappedApiInputItems = [];
    const operation = this.form.get([formcontrol]).value;

    if (operation === 'CREATE' || operation === 'UPDATE') {
      const bodyparam: APIInput = {
        paramType: APIParamType.BODY,
      };
      this.mappedApiInputItems.push({ label: 'BODY', value: bodyparam });
    } else if (operation === 'FILE_UPLOAD') {
      const bodyparam: APIInput = {
        paramType: APIParamType.FILE,
      };
      this.mappedApiInputItems.push({ label: 'FILE', value: bodyparam });
    }

    this.workflowMapParamChange();
  }

  workflowMapParamChange() {
    console.log(this.mappedApiInputItems);
    if (this.mappedApiInputItems && this.apiParams) {
      for (let i = 0; i < this.apiParams.length; i++) {
        const dropdownLabel = this.apiParams[i].inputName + ' ' + this.apiParams[i].paramType;
        this.mappedApiInputItems.push({ label: dropdownLabel, value: this.apiParams[i] });
      }
    }
  }

  onWorkflowChange() {
    this.workflowInputItems = [];
    const subrule = this.form.get(['selectedSubrule']).value;
    if (subrule) {
      for (let i = 0; i < subrule.params.length; i++) {
        const dropdownLabel = subrule.params[i].paramName;
        this.workflowInputItems.push({ label: dropdownLabel, value: subrule.params[i] });
      }
    }
  }

  loadUpdateForm() {
    let enableSecurity = false;
    // if (!this.projectSecurity) {
    //   enableSecurity = false;
    // }
    if (this.apiID) {
      if (this.apiStyle === 'REST') {
        if (this.editType === 'API') {
          this.apiService
              .find(this.apiID, this.projectUid)
              .pipe(
                  filter((mayBeOk: HttpResponse<IApi>) => mayBeOk.ok),
                  map((response: HttpResponse<IApi>) => response.body)
              )
              .subscribe(
                  (res: IApi) => {
                    this.currentApi = res;
                    if (this.currentApi.params) {
                      this.apiParams = this.currentApi.params;
                      this.workflowMapParamChange();
                    }

                    let subrule: ISubrule;
                    if (this.currentApi.subruleuuid) {
                      subrule = this.allSubRules.find(item => item.uuid === this.currentApi.subruleuuid);
                      if (subrule && subrule.params) {
                        for (let i = 0; i < subrule.params.length; i++) {
                          const dropdownLabel = subrule.params[i].paramName;
                          this.workflowInputItems.push({ label: dropdownLabel, value: subrule.params[i] });
                        }
                      }
                    }
                    if (this.currentApi.subruleMapping) {
                      this.worlflowMappings = this.currentApi.subruleMapping;
                    }

                    // if (this.projectSecurity) {
                    enableSecurity = this.currentApi.enableSecurity;
                    // }

                    this.form.patchValue({
                      id: this.currentApi.uuid,
                      apitype: 'API',
                      apiStyleType: this.currentApi.apiStyleType,
                      grpcMethod: this.currentApi.grpcMethod,
                      name: this.currentApi.name,
                      resourcePath: this.currentApi.resourcePath,
                      selectedAPIInputs: this.currentApi.aPIInputs,
                      operation: this.currentApi.operation,
                      returnRecordType: this.currentApi.returnRecordType,
                      returnObj: this.currentApi.returnObj,
                      enableSecurity,
                      selectedSubrule: subrule,
                    });
                  },
                  (res: HttpErrorResponse) => this.onError(res.message)
              );
        } else if (this.editType === 'COMMAND') {
          this.commandService
              .find(this.apiID, this.projectUid)
              .pipe(
                  filter((mayBeOk: HttpResponse<ICommand>) => mayBeOk.ok),
                  map((response: HttpResponse<ICommand>) => response.body)
              )
              .subscribe(
                  (res: ICommand) => {
                    this.currentCommand = res;
                    let event: IEvent;
                    if (this.currentCommand.event) {
                      event = this.events.find(item => item.uuid == this.currentCommand.event.uuid);
                    } else {
                      event = this.currentCommand.event;
                    }

                    let subrule: ISubrule;
                    if (this.currentCommand.subruleuuid) {
                      subrule = this.allSubRules.find(item => item.uuid === this.currentCommand.subruleuuid);
                      if (subrule && subrule.params) {
                        for (let i = 0; i < subrule.params.length; i++) {
                          const dropdownLabel = subrule.params[i].paramName;
                          this.workflowInputItems.push({ label: dropdownLabel, value: subrule.params[i] });
                        }
                      }
                    }
                    if (this.currentCommand.subruleMapping) {
                      this.worlflowMappings = this.currentCommand.subruleMapping;
                    }

                    // if (this.projectSecurity) {
                    enableSecurity = this.currentCommand.enableSecurity;
                    // }

                    this.form.patchValue({
                      id: this.currentCommand.uuid,
                      apitype: 'COMMAND',
                      apiStyleType: this.currentCommand.apiStyleType,
                      grpcMethod: this.currentCommand.grpcMethod,
                      selectedEvent: event,
                      operationType: this.currentCommand.operationType,
                      name: this.currentCommand.name,
                      resourcePath: this.currentCommand.resourcePath,
                      description: this.currentCommand.description,
                      enableSecurity,
                      selectedSubrule: subrule,
                    });
                  },
                  (res: HttpErrorResponse) => this.onError(res.message)
              );
        } else if (this.editType === 'QUERY') {
          this.queryService
              .find(this.apiID, this.projectUid)
              .pipe(
                  filter((mayBeOk: HttpResponse<IQuery>) => mayBeOk.ok),
                  map((response: HttpResponse<IQuery>) => response.body)
              )
              .subscribe(
                  (res: IQuery) => {
                    this.currentQuery = res;
                    if (this.currentQuery.params) {
                      this.apiParams = this.currentQuery.params;
                      this.workflowMapParamChange();
                    }
                    // if (this.projectSecurity) {
                    enableSecurity = this.currentQuery.enableSecurity;
                    // }
                    let subrule: ISubrule;
                    if (this.currentQuery.subruleuuid) {
                      subrule = this.allSubRules.find(item => item.uuid == this.currentQuery.subruleuuid);
                      if (subrule && subrule.params) {
                        for (let i = 0; i < subrule.params.length; i++) {
                          const dropdownLabel = subrule.params[i].paramName;
                          this.workflowInputItems.push({ label: dropdownLabel, value: subrule.params[i] });
                        }
                      }
                    }
                    if (this.currentQuery.subruleMapping) {
                      this.worlflowMappings = this.currentQuery.subruleMapping;
                    }

                    let viewmodel: IViewmodel;

                    if (this.currentQuery.viewmodel) {
                      viewmodel = this.viewmodels.find(item => item.uuid == this.currentQuery.viewmodel.uuid);
                    } else {
                      viewmodel = this.currentQuery.viewmodel;
                    }

                    this.form.patchValue({
                      id: this.currentQuery.uuid,
                      apitype: 'QUERY',
                      apiStyleType: this.currentQuery.apiStyleType,
                      grpcMethod: this.currentQuery.grpcMethod,
                      selectedViewmodel: viewmodel,
                      name: this.currentQuery.name,
                      returnRecordType: this.currentQuery.returnRecordType,
                      resourcePath: this.currentQuery.resourcePath,
                      description: this.currentQuery.description,
                      enableSecurity,
                      selectedSubrule: subrule,
                    });
                  },
                  (res: HttpErrorResponse) => this.onError(res.message)
              );
        } else {
          if (this.editType === 'FILE_UPLOAD' || this.editType === 'FILE_DOWNLOAD') {
            this.apiService
                .find(this.apiID, this.projectUid)
                .pipe(
                    filter((mayBeOk: HttpResponse<IApi>) => mayBeOk.ok),
                    map((response: HttpResponse<IApi>) => response.body)
                )
                .subscribe(
                    (res: IApi) => {
                      this.currentApi = res;
                      if (this.currentApi.params) {
                        this.apiParams = this.currentApi.params;
                        this.workflowMapParamChange();
                      }

                      let subrule: ISubrule;
                      if (this.currentApi.subruleuuid) {
                        subrule = this.allSubRules.find(item => item.uuid == this.currentApi.subruleuuid);
                        if (subrule && subrule.params) {
                          for (let i = 0; i < subrule.params.length; i++) {
                            const dropdownLabel = subrule.params[i].paramName;
                            this.workflowInputItems.push({ label: dropdownLabel, value: subrule.params[i] });
                          }
                        }
                      }
                      if (this.currentApi.subruleMapping) {
                        this.worlflowMappings = this.currentApi.subruleMapping;
                      }
                      // if (this.projectSecurity) {
                      enableSecurity = this.currentApi.enableSecurity;
                      // }

                      this.form.patchValue({
                        id: this.currentApi.uuid,
                        apitype: this.currentApi.type,
                        apiStyleType: this.currentApi.apiStyleType,
                        grpcMethod: this.currentApi.grpcMethod,
                        name: this.currentApi.name,
                        resourcePath: this.currentApi.resourcePath,
                        returnRecordType: this.currentApi.returnRecordType,
                        returnObj: this.currentApi.returnObj,
                        enableSecurity,
                        selectedSubrule: subrule,
                      });
                    },
                    (res: HttpErrorResponse) => this.onError(res.message)
                );
          }
        }
      } else {
        // GRPC
        this.apiService
            .find(this.apiID, this.projectUid)
            .pipe(
                filter((mayBeOk: HttpResponse<IApi>) => mayBeOk.ok),
                map((response: HttpResponse<IApi>) => response.body)
            )
            .subscribe(
                (res: IApi) => {
                  this.currentApi = res;
                  // if (this.projectSecurity) {
                  enableSecurity = this.currentApi.enableSecurity;
                  // }
                  let subrule: ISubrule;
                  if (this.currentApi.subruleuuid) {
                    subrule = this.allSubRules.find(item => item.uuid == this.currentApi.subruleuuid);
                    if (subrule && subrule.params) {
                      for (let i = 0; i < subrule.params.length; i++) {
                        const dropdownLabel = subrule.params[i].paramName;
                        this.workflowInputItems.push({ label: dropdownLabel, value: subrule.params[i] });
                      }
                    }
                  }
                  if (this.currentApi.subruleMapping) {
                    this.worlflowMappings = this.currentApi.subruleMapping;
                  }

                  this.form.patchValue({
                    id: this.currentApi.uuid,
                    apiStyleType: this.currentApi.apiStyleType,
                    grpcMethod: this.currentApi.grpcMethod,
                    name: this.currentApi.name,
                    selectedAPIInputs: this.currentApi.aPIInputs,
                    returnRecordType: this.currentApi.returnRecordType,
                    returnObj: this.currentApi.returnObj,
                    enableSecurity,
                    selectedSubrule: subrule,
                  });
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
        if (this.project.template === 'sidecar') {
          this.form.get('name').disable();
        }
      }
    } else {
      this.form.get('apiStyleType').patchValue('REST', { emitEvent: true });
      if (this.project.template === 'cqrs') {
        this.form.get('apitype').patchValue('COMMAND', { emitEvent: true });
      } else {
        this.form.get('apitype').patchValue('API', { emitEvent: true });
      }
    }
  }

  loadEvents() {
    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i].status === 'ENABLED') {
        const dropdownLabel = this.events[i].name;
        this.eventItems.push({ label: dropdownLabel, value: this.events[i] });
      }
    }
  }

  loadSubrules() {
    for (let i = 0; i < this.allSubRules.length; i++) {
      const dropdownLabel = this.allSubRules[i].name;
      this.subruleItems.push({ label: dropdownLabel, value: this.allSubRules[i] });
    }
  }

  loadAggregates() {
    for (let i = 0; i < this.aggregates.length; i++) {
      if (this.aggregates[i].status === 'ENABLED' && this.aggregates[i].type === 'MODEL') {
        const dropdownLabel = this.aggregates[i].name + ' : Model';
        this.aggregateItems.push({ label: dropdownLabel, value: this.aggregates[i] });
        const input = {
          id: this.aggregates[i].uuid,
          paramType: APIParamType.BODY,
          inputType: APIInputType.MODEL,
          inputName: this.aggregates[i].name,
        };
        const returnObj = {
          id: this.aggregates[i].uuid,
          paramType: APIParamType.RETURN,
          inputType: APIInputType.MODEL,
          inputName: this.aggregates[i].name,
        };
        this.items.push({ label: dropdownLabel, value: input });
        this.returnItems.push({ label: dropdownLabel, value: returnObj });
      } else if (this.aggregates[i].status === 'ENABLED' && this.aggregates[i].type === 'DTO') {
        const dropdownLabel = this.aggregates[i].name + ' : DTO';
        this.aggregateItems.push({ label: dropdownLabel, value: this.aggregates[i] });
        const input = {
          id: this.aggregates[i].uuid,
          paramType: APIParamType.BODY,
          inputType: APIInputType.DTO,
          inputName: this.aggregates[i].name,
        };
        const returnObj = {
          id: this.aggregates[i].uuid,
          paramType: APIParamType.RETURN,
          inputType: APIInputType.DTO,
          inputName: this.aggregates[i].name,
        };
        this.items.push({ label: dropdownLabel, value: input });
        this.returnItems.push({ label: dropdownLabel, value: returnObj });
      }
    }
  }

  loadViewmodels() {
    for (let i = 0; i < this.viewmodels.length; i++) {
      if (this.viewmodels[i].status === 'ENABLED') {
        const dropdownLabel = this.viewmodels[i].name;
        this.viewmodelItems.push({ label: dropdownLabel, value: this.viewmodels[i] });
        const dtodropdownLabel = this.viewmodels[i].name + ' : DTO';
        this.aggregateItems.push({ label: dtodropdownLabel, value: this.viewmodels[i] });
        const input = {
          id: this.viewmodels[i].uuid,
          paramType: APIParamType.BODY,
          inputType: APIInputType.DTO,
          inputName: this.viewmodels[i].name,
        };
        const returnObj = {
          id: this.viewmodels[i].uuid,
          paramType: APIParamType.RETURN,
          inputType: APIInputType.DTO,
          inputName: this.viewmodels[i].name,
        };
        this.items.push({ label: dtodropdownLabel, value: input });
        this.returnItems.push({ label: dtodropdownLabel, value: returnObj });
      }
    }
  }

  addPrimitivesForReturnSelect() {
    const dropdownLabelText = 'TEXT';
    const stringReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.RETURN,
      inputType: APIInputType.TEXT,
      inputName: '_s',
    };
    const dropdownLabelNumber = 'NUMBER';
    const intReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.RETURN,
      inputType: APIInputType.NUMBER,
      inputName: '_i',
    };
    const dropdownLabelFloat = 'FLOAT';
    const floatReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.RETURN,
      inputType: APIInputType.FLOAT,
      inputName: '_f',
    };
    const dropdownLabelBoolean = 'TRUE_OR_FALSE';
    const boolReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.RETURN,
      inputType: APIInputType.TRUE_OR_FALSE,
      inputName: '_b',
    };
    const dropdownLabelDate = 'DATE';
    const dateReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.RETURN,
      inputType: APIInputType.DATE,
      inputName: '_t',
    };
    this.returnItems.push({ label: dropdownLabelText, value: stringReturnObj });
    this.returnItems.push({ label: dropdownLabelNumber, value: intReturnObj });
    this.returnItems.push({ label: dropdownLabelFloat, value: floatReturnObj });
    this.returnItems.push({ label: dropdownLabelBoolean, value: boolReturnObj });
    this.returnItems.push({ label: dropdownLabelDate, value: dateReturnObj });
  }

  addRow() {
    const paramType = this.form.get(['paramType']).value;
    const paramName = this.form.get(['paramName']).value;
    const paramDataType = this.form.get(['paramDataType']).value;

    if (paramType === null || paramName === '' || paramName === null || paramDataType === null) {
      // this.messageService.add({
      //   severity: 'warn',
      //   summary: 'Warn',
      //   detail: 'Please fill all the fields',
      // });
    } else {
      const param: APIInput = {
        paramType,
        inputType: paramDataType,
        inputName: paramName,
      };

      this.apiParams.push(param);
      if (this.mappedApiInputItems) {
        const dropdownLabel = paramName + ' ' + paramType;
        this.mappedApiInputItems.push({ label: dropdownLabel, value: param });
      }

      this.ELEMENT_DATA.push(param);
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);

      // this.workflowMapParamChange();
    }
  }

  addMappingRow() {
    const workflowInput = this.form.get(['workflowInput']).value;
    const mappedApiInput = this.form.get(['mappedApiInput']).value;

    if (workflowInput === null || mappedApiInput === null) {
      // this.messageService.add({
      //   severity: 'warn',
      //   summary: 'Warn',
      //   detail: 'Please fill all the fields',
      // });
    } else {
      const param: WorkflowMapping = {
        subruleInput: workflowInput,
        mappedInput: mappedApiInput,
      };

      this.worlflowMappings.push(param);
      this.WORKFLOW_MAP.push(param);
      this.workFlowSource = new MatTableDataSource(this.WORKFLOW_MAP);
    }
  }

  deleteMappingRow(param) {
    const index = this.worlflowMappings.indexOf(param);
    this.worlflowMappings.splice(index, 1);

    const indexnum = this.WORKFLOW_MAP.indexOf(param);
    this.WORKFLOW_MAP.splice(indexnum, 1);
    this.workFlowSource = new MatTableDataSource(this.WORKFLOW_MAP);
  }

  deleteRow(param) {
    const indexnum = this.ELEMENT_DATA.indexOf(param);
    this.ELEMENT_DATA.splice(indexnum, 1);
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    const index = this.apiParams.indexOf(param);
    this.apiParams.splice(index, 1);
    this.onAPITypeChange();
  }

  onAPITypeChange() {
    const apiType = this.form.get(['apitype']).value;
    if (apiType === 'COMMAND') {
      this.workflowMapItemsOnOperationChange('operationType');
    } else if (apiType === 'API') {
      this.workflowMapItemsOnOperationChange('operation');
    } else if (apiType === 'FILE_UPLOAD') {
      this.workflowMapItemsOnOperationChange('apitype');
    } else {
      this.mappedApiInputItems = [];
      this.workflowMapParamChange();
    }
  }

  updateForm(api: IApi) {
    this.form.patchValue({
      id: api.uuid,
      name: api.name,
      selectedAPIInputs: api.aPIInputs,
      params: api.params,
      operation: api.operation,
      returnRecordType: api.returnRecordType,
      returnObj: api.returnObj,
    });
  }

  previousState() {
    window.history.back();
  }

  save() {
    // this.spinnerService.show();
    this.isSaving = true;

    const apiStyleType = this.form.get(['apiStyleType']).value;
    const apiType = this.form.get(['apitype']).value;

    if (apiStyleType === 'GRPC') {
      const api = this.createGrpcAPIFromForm();
      if (api.uuid) {
        api.status = this.currentApi.status;
        this.subscribeToSaveResponse(this.apiService.update(api, this.projectUid));
      } else {
        this.subscribeToSaveResponse(this.apiService.create(api, this.projectUid));
      }
    } else {
      if (apiType === 'API') {
        const api = this.createFromForm();
        if (api.uuid) {
          api.status = this.currentApi.status;
          this.subscribeToSaveResponse(this.apiService.update(api, this.projectUid));
        } else {
          this.subscribeToSaveResponse(this.apiService.create(api, this.projectUid));
        }
      } else if (apiType === 'COMMAND') {
        const command = this.createCommandFromForm();
        if (command.uuid) {
          command.status = this.currentCommand.status;
          this.subscribeToSaveResponse(this.commandService.update(command, this.projectUid));
        } else {
          this.subscribeToSaveResponse(this.commandService.create(command, this.projectUid));
        }
      } else if (apiType === 'QUERY') {
        const query = this.createQueryFromForm();
        if (query.uuid) {
          query.status = this.currentQuery.status;
          this.subscribeToSaveResponse(this.queryService.update(query, this.projectUid));
        } else {
          this.subscribeToSaveResponse(this.queryService.create(query, this.projectUid));
        }
      } else if (apiType === 'FILE_UPLOAD') {
        const api = this.createFileUploadFromForm();
        if (api.uuid) {
          api.status = this.currentApi.status;
          this.subscribeToSaveResponse(this.apiService.update(api, this.projectUid));
        } else {
          this.subscribeToSaveResponse(this.apiService.create(api, this.projectUid));
        }
      } else if (apiType === 'FILE_DOWNLOAD') {
        const api = this.createFileDownloadFromForm();
        if (api.uuid) {
          api.status = this.currentApi.status;
          this.subscribeToSaveResponse(this.apiService.update(api, this.projectUid));
        } else {
          this.subscribeToSaveResponse(this.apiService.create(api, this.projectUid));
        }
      }
    }
  }

  private createCommandFromForm(): ICommand {
    // let enableSecurity: boolean = false;
    // if (this.projectSecurity) {
    const enableSecurity = this.form.get(['enableSecurity']).value;
    // } else {
    // enableSecurity = false;
    // }

    const apiStyleType = this.form.get(['apiStyleType']).value;
    let grpcMethod = '';

    if (apiStyleType === 'GRPC') {
      grpcMethod = this.form.get(['grpcMethod']).value;
    }

    const apiData = {
      ...new Command(),
      uuid: this.form.get(['id']).value,
      grpcMethod,
      operationType: this.form.get(['operationType']).value,
      event: this.form.get(['selectedEvent']).value,
      name: this.form.get(['name']).value,
      description: this.form.get(['description']).value,
      projectUuid: this.projectUid,
      resourcePath: this.form.get(['resourcePath']).value,
      apiStyleType: this.form.get(['apiStyleType']).value,
      enableSecurity,
      subruleMapping: this.worlflowMappings,
      createWorkflow: this.form.get(['createWorkflow']).value,
    };
    if (!this.form.get(['createWorkflow']).value && this.form.get(['selectedSubrule']).value) {
      apiData.subruleuuid = this.form.get(['selectedSubrule']).value.uuid;
    }
    return apiData;
  }

  private createQueryFromForm(): IQuery {
    // let enableSecurity: boolean = false;
    // if (this.projectSecurity) {
    const enableSecurity = this.form.get(['enableSecurity']).value;
    // } else {
    // enableSecurity = false;
    // }

    const apiStyleType = this.form.get(['apiStyleType']).value;
    let grpcMethod = '';

    if (apiStyleType === 'GRPC') {
      grpcMethod = this.form.get(['grpcMethod']).value;
    }

    const apiData = {
      ...new Query(),
      uuid: this.form.get(['id']).value,
      grpcMethod,
      params: this.apiParams,
      viewmodel: this.form.get(['selectedViewmodel']).value,
      name: this.form.get(['name']).value,
      description: this.form.get(['description']).value,
      projectUuid: this.projectUid,
      returnRecordType: this.form.get(['returnRecordType']).value,
      resourcePath: this.form.get(['resourcePath']).value,
      apiStyleType: this.form.get(['apiStyleType']).value,
      enableSecurity,
      subruleMapping: this.worlflowMappings,
      createWorkflow: this.form.get(['createWorkflow']).value,
    };
    if (!this.form.get(['createWorkflow']).value && this.form.get(['selectedSubrule']).value) {
      apiData.subruleuuid = this.form.get(['selectedSubrule']).value.uuid;
    }
    return apiData;
  }

  private createFromForm(): IApi {
    // let enableSecurity: boolean = false;
    // if (this.projectSecurity) {
    const enableSecurity = this.form.get(['enableSecurity']).value;
    // } else {
    // enableSecurity = false;
    // }

    const apiStyleType = this.form.get(['apiStyleType']).value;
    let grpcMethod = '';

    if (apiStyleType === 'GRPC') {
      grpcMethod = this.form.get(['grpcMethod']).value;
    }

    const apiData = {
      ...new Api(),
      uuid: this.form.get(['id']).value,
      grpcMethod,
      type: 'API',
      name: this.form.get(['name']).value,
      aPIInputs: this.form.get(['selectedAPIInputs']).value,
      params: this.apiParams,
      returnRecordType: this.form.get(['returnRecordType']).value,
      returnObj: this.form.get(['returnObj']).value,
      operation: this.form.get(['operation']).value,
      projectUuid: this.projectUid,
      resourcePath: this.form.get(['resourcePath']).value,
      apiStyleType: this.form.get(['apiStyleType']).value,
      enableSecurity,
      subruleMapping: this.worlflowMappings,
      createWorkflow: this.form.get(['createWorkflow']).value,
    };
    if (!this.form.get(['createWorkflow']).value && this.form.get(['selectedSubrule']).value) {
      apiData.subruleuuid = this.form.get(['selectedSubrule']).value.uuid;
    }
    return apiData;
  }

  private createGrpcAPIFromForm(): IApi {
    // let enableSecurity: boolean = false;
    // if (this.projectSecurity) {
    const enableSecurity = this.form.get(['enableSecurity']).value;
    // } else {
    // enableSecurity = false;
    // }

    console.log(enableSecurity);

    const apiStyleType = this.form.get(['apiStyleType']).value;
    const grpcMethod = this.form.get(['grpcMethod']).value;

    const apiData = {
      ...new Api(),
      uuid: this.form.get(['id']).value,
      grpcMethod,
      type: 'API',
      name: this.form.get(['name']).value,
      aPIInputs: this.form.get(['selectedAPIInputs']).value,
      params: [],
      returnRecordType: this.form.get(['returnRecordType']).value,
      returnObj: this.form.get(['returnObj']).value,
      operation: '',
      projectUuid: this.projectUid,
      resourcePath: '',
      apiStyleType: this.form.get(['apiStyleType']).value,
      enableSecurity,
      subruleMapping: this.worlflowMappings,
      createWorkflow: this.form.get(['createWorkflow']).value,
    };
    if (!this.form.get(['createWorkflow']).value && this.form.get(['selectedSubrule']).value) {
      apiData.subruleuuid = this.form.get(['selectedSubrule']).value.uuid;
    }
    return apiData;
  }

  private createFileUploadFromForm(): IApi {
    // let enableSecurity: boolean = false;
    // if (this.projectSecurity) {
    const enableSecurity = this.form.get(['enableSecurity']).value;
    // } else {
    // enableSecurity = false;
    // }
    const apiStyleType = this.form.get(['apiStyleType']).value;
    let grpcMethod = '';

    if (apiStyleType === 'GRPC') {
      grpcMethod = this.form.get(['grpcMethod']).value;
    }

    const apiData = {
      ...new Api(),
      uuid: this.form.get(['id']).value,
      grpcMethod,
      type: 'FILE_UPLOAD',
      name: this.form.get(['name']).value,
      params: this.apiParams,
      returnRecordType: this.form.get(['returnRecordType']).value,
      returnObj: this.form.get(['returnObj']).value,
      operation: 'CREATE',
      projectUuid: this.projectUid,
      resourcePath: this.form.get(['resourcePath']).value,
      apiStyleType: this.form.get(['apiStyleType']).value,
      enableSecurity,
      subruleMapping: this.worlflowMappings,
      createWorkflow: this.form.get(['createWorkflow']).value,
    };
    if (!this.form.get(['createWorkflow']).value && this.form.get(['selectedSubrule']).value) {
      apiData.subruleuuid = this.form.get(['selectedSubrule']).value.uuid;
    }
    return apiData;
  }

  private createFileDownloadFromForm(): IApi {
    // let enableSecurity: boolean = false;
    // if (this.projectSecurity) {
    const enableSecurity = this.form.get(['enableSecurity']).value;
    // } else {
    // enableSecurity = false;
    // }
    const apiStyleType = this.form.get(['apiStyleType']).value;
    let grpcMethod = '';

    if (apiStyleType === 'GRPC') {
      grpcMethod = this.form.get(['grpcMethod']).value;
    }

    const apiData = {
      ...new Api(),
      uuid: this.form.get(['id']).value,
      grpcMethod,
      type: 'FILE_DOWNLOAD',
      name: this.form.get(['name']).value,
      params: this.apiParams,
      returnRecordType: 's',
      operation: 'FIND',
      projectUuid: this.projectUid,
      resourcePath: this.form.get(['resourcePath']).value,
      apiStyleType: this.form.get(['apiStyleType']).value,
      enableSecurity,
      subruleMapping: this.worlflowMappings,
      createWorkflow: this.form.get(['createWorkflow']).value,
    };
    if (!this.form.get(['createWorkflow']).value && this.form.get(['selectedSubrule']).value) {
      apiData.subruleuuid = this.form.get(['selectedSubrule']).value.uuid;
    }
    return apiData;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IApi>>) {
    result.subscribe(
        () => this.onSaveSuccess(),
        () => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    // this.spinnerService.hide();
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError() {
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

}

export class Parammapping {
  name?: string;
  datatype?: string;
  param?: string;
}

export class Workflowmapping {
  workflowinput?: string;
  apiinput?: string;
}
