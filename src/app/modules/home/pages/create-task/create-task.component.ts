import {Component, Inject, OnInit} from '@angular/core';
import {IProject} from '@shared/models/model/project.model';
import {ITask, Task} from '@shared/models/model/task.model';
import {IAggregate} from '@shared/models/model/aggregate.model';
import {ICustomObject} from '@shared/models/model/custom-object.model';
import {APIInput, APIInputType, APIParamType, IWorkflowMapping, WorkflowMapping} from '@shared/models/model/api-input.model';
import { IEvent } from '@app/shared/models/model/microservice-event.model';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {IViewmodel} from '@shared/models/model/viewmodel.model';
import {ISubrule} from '@shared/models/model/subrule.model';
import {ActivatedRoute} from '@angular/router';
import {ProjectService} from '@core/projectservices/project.service';
import {TaskService} from '@core/projectservices/microservice-task.service';
import { Observable } from 'rxjs';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {filter, map} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
interface Item {
  value: any;
  label: string;
}
@Component({
  selector: 'virtuan-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.scss']
})
export class CreateTaskComponent implements OnInit {

  isSaving: boolean;
  project: IProject;
  currentTask: ITask;
  events: IEvent[];
  eventItems: Item[];
  apiParams: APIInput[];
  customObjects: ICustomObject[];
  aggregates: IAggregate[];
  subruleItems: Item[];
  workflowInputItems: Item[];
  mappedApiInputItems: Item[];
  worlflowMappings: IWorkflowMapping[];
  allSubRules: ISubrule[];

  frequencyItems: Item[] = [
    { label: 'Single', value: 'SINGLE' },
    { label: 'Multiple', value: 'MULTIPLE' },
  ];
  categoryItems: Item[] = [
    { label: 'Subscriber', value: 'SUBSCRIBER' },
    { label: 'Periodic', value: 'PERIODIC' },
  ];
  operationItems: Item[] = [
    { label: 'General', value: 'GENERAL' },
    { label: 'File Reader', value: 'FILE_READER' },
    { label: 'Message Subscriber', value: 'MESSAGE_SUBSCRIBER' },
    { label: 'Service Call', value: 'SERVICE_CALL' },
  ];
  timeUnitItems: Item[] = [
    { label: 'Seconds', value: 's' },
    { label: 'Minutes', value: 'min' },
    { label: 'Hours', value: 'h' },
  ];
  fileTypeItems: Item[] = [
    { label: 'Image', value: 'IMAGE' },
    { label: 'Pdf', value: 'PDF' },
  ];
  serviceCallTypeItems: Item[] = [
    { label: 'REST', value: 'REST' },
    { label: 'RPC', value: 'RPC' },
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

  actionItems: Item[] = [
    { label: 'CREATE', value: 'CREATE' },
    { label: 'UPDATE', value: 'UPDATE' },
    { label: 'DELETE', value: 'DELETE' },
    { label: 'FIND', value: 'FIND' },
  ];
  items: Item[];
  returnItems: Item[];
  viewmodels: IViewmodel[];
  filetargetItems: Item[];
  editForm: FormGroup;
  projectUid: string;

  displayedColumns: string[] = ['name', 'datatype', 'recordtype', 'actions'];
  ELEMENT_DATA: APIInput[] = [];
  dataSource = new MatTableDataSource(this.ELEMENT_DATA);

  displayedColumnsWorkflow: string[] = ['workflowinput', 'apiinput', 'actions'];
  WORKFLOW_MAP: WorkflowMapping[] = [];
  workFlowSource = new MatTableDataSource(this.WORKFLOW_MAP);

  builTaskdForm() {
    this.editForm = this.fb.group({
      id: [],
      operation: ['', [Validators.required]],
      frequency: ['', [Validators.required]],
      // fileType: [],
      fileLocation: [],
      serviceCallType: [],
      url: [],
      action: [],
      targetInput: [],
      returnObj: [],
      returnRecordType: [],
      // category: [],
      selectedEvent: [],
      name: ['', [Validators.required]],
      description: [],
      subject: [],
      timeUnit: [],
      time: [],
      paramType: [],
      paramName: [],
      paramDataType: [],
      fileinput: [],
      selectedSubrule: [],
      workflowInput: [],
      mappedApiInput: [],
      createWorkflow: false,
    });
  }

  setTaskCategoryValidators() {
    this.editForm.get('frequency').valueChanges.subscribe(frequency => {
      if (frequency === 'MULTIPLE') {
        this.editForm.get('timeUnit').setValidators([Validators.required]);
        this.editForm.get('timeUnit').updateValueAndValidity();

        this.editForm.get('time').setValidators([Validators.required]);
        this.editForm.get('time').updateValueAndValidity();
      } else {
        this.editForm.get('timeUnit').clearValidators();
        this.editForm.get('timeUnit').updateValueAndValidity();

        this.editForm.get('time').clearValidators();
        this.editForm.get('time').updateValueAndValidity();
      }
    });

    this.editForm.get('operation').valueChanges.subscribe(operation => {
      if (operation === 'GENERAL') {
        this.editForm.get('fileinput').clearValidators();
        this.editForm.get('fileinput').updateValueAndValidity();

        this.editForm.get('fileLocation').clearValidators();
        this.editForm.get('fileLocation').updateValueAndValidity();

        this.editForm.get('selectedEvent').clearValidators();
        this.editForm.get('selectedEvent').updateValueAndValidity();

        this.editForm.get('subject').clearValidators();
        this.editForm.get('subject').updateValueAndValidity();

        this.editForm.get('serviceCallType').clearValidators();
        this.editForm.get('serviceCallType').updateValueAndValidity();

        this.editForm.get('url').clearValidators();
        this.editForm.get('url').updateValueAndValidity();

        this.editForm.get('action').clearValidators();
        this.editForm.get('action').updateValueAndValidity();

        this.editForm.get('targetInput').clearValidators();
        this.editForm.get('targetInput').updateValueAndValidity();
      }

      if (operation === 'FILE_READER') {
        this.editForm.get('fileinput').setValidators([Validators.required]);
        this.editForm.get('fileinput').updateValueAndValidity();

        this.editForm.get('fileLocation').setValidators([Validators.required]);
        this.editForm.get('fileLocation').updateValueAndValidity();

        this.editForm.get('selectedEvent').clearValidators();
        this.editForm.get('selectedEvent').updateValueAndValidity();

        this.editForm.get('subject').clearValidators();
        this.editForm.get('subject').updateValueAndValidity();

        this.editForm.get('serviceCallType').clearValidators();
        this.editForm.get('serviceCallType').updateValueAndValidity();

        this.editForm.get('url').clearValidators();
        this.editForm.get('url').updateValueAndValidity();

        this.editForm.get('action').clearValidators();
        this.editForm.get('action').updateValueAndValidity();

        this.editForm.get('targetInput').clearValidators();
        this.editForm.get('targetInput').updateValueAndValidity();
      }

      if (operation === 'SERVICE_CALL') {
        this.editForm.get('fileinput').clearValidators();
        this.editForm.get('fileinput').updateValueAndValidity();

        this.editForm.get('fileLocation').clearValidators();
        this.editForm.get('fileLocation').updateValueAndValidity();

        this.editForm.get('selectedEvent').clearValidators();
        this.editForm.get('selectedEvent').updateValueAndValidity();

        this.editForm.get('subject').clearValidators();
        this.editForm.get('subject').updateValueAndValidity();

        this.editForm.get('serviceCallType').setValidators([Validators.required]);
        this.editForm.get('serviceCallType').updateValueAndValidity();

        this.editForm.get('url').setValidators([Validators.required]);
        this.editForm.get('url').updateValueAndValidity();

        this.editForm.get('action').setValidators([Validators.required]);
        this.editForm.get('action').updateValueAndValidity();

        this.editForm.get('targetInput').setValidators([Validators.required]);
        this.editForm.get('targetInput').updateValueAndValidity();
      }

      if (operation === 'MESSAGE_SUBSCRIBER') {
        this.editForm.get('fileinput').clearValidators();
        this.editForm.get('fileinput').updateValueAndValidity();

        this.editForm.get('fileLocation').clearValidators();
        this.editForm.get('fileLocation').updateValueAndValidity();

        this.editForm.get('selectedEvent').setValidators([Validators.required]);
        this.editForm.get('selectedEvent').updateValueAndValidity();

        this.editForm.get('subject').setValidators([Validators.required]);
        this.editForm.get('subject').updateValueAndValidity();

        this.editForm.get('serviceCallType').clearValidators();
        this.editForm.get('serviceCallType').updateValueAndValidity();

        this.editForm.get('url').clearValidators();
        this.editForm.get('url').updateValueAndValidity();

        this.editForm.get('action').clearValidators();
        this.editForm.get('action').updateValueAndValidity();

        this.editForm.get('targetInput').clearValidators();
        this.editForm.get('targetInput').updateValueAndValidity();
      }
    });
  }

  constructor(
      protected taskService: TaskService,
      protected projectService: ProjectService,
      protected activatedRoute: ActivatedRoute,
      private fb: FormBuilder,
      public dialogRef: MatDialogRef<CreateTaskComponent>,
      @Inject(MAT_DIALOG_DATA)  public data: any,
  ) {}

  ngOnInit(): void {
    this.getTaskData();
  }


  // ngOnChanges(changes: SimpleChanges) {
  //   if (this.isVisible) {
  //     this.getTaskData();
  //   }
  // }

  getTaskData() {
    this.builTaskdForm();
    this.projectUid = this.data.projectUid;
    this.setTaskCategoryValidators();
    this.isSaving = false;
    this.eventItems = [];
    this.items = [];
    this.returnItems = [];
    this.apiParams = [];
    this.subruleItems = [];
    this.workflowInputItems = [];
    this.mappedApiInputItems = [];
    this.worlflowMappings = [];
    this.filetargetItems = [];
    this.addPrimitivesForReturnSelect();
    // this.projectId = params['projId'];
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
                this.events = this.project.events;
                this.customObjects = this.project.customObjects;
                this.aggregates = this.project.aggregates;
                this.allSubRules = this.project.subRulevms;
                if (this.aggregates) {
                  this.loadAggregates();
                }
                if (this.events) {
                  this.loadEvents();
                }
                this.viewmodels = this.project.viewmodels;

                if (this.viewmodels) {
                  this.loadViewmodels();
                }
                if (this.allSubRules) {
                  this.loadSubrules();
                }
                // if (this.createStatus == 'update') {
                //   this.loadUpdateForm();
                // }
              },
              (res: HttpErrorResponse) => this.onError(res.message)
          );
    } else {
      // if (this.createStatus == 'update') {
      //   this.loadUpdateForm();
      // }
    }
  }

  loadSubrules() {
    for (let i = 0; i < this.allSubRules.length; i++) {
      const dropdownLabel = this.allSubRules[i].name;
      this.subruleItems.push({ label: dropdownLabel, value: this.allSubRules[i] });
    }
  }

  onWorkflowChange() {
    this.workflowInputItems = [];
    const subrule = this.editForm.get(['selectedSubrule']).value;
    if (subrule) {
      for (let i = 0; i < subrule.params.length; i++) {
        const dropdownLabel = subrule.params[i].paramName;
        this.workflowInputItems.push({ label: dropdownLabel, value: subrule.params[i] });
      }
    }
  }

  workflowMapItemsOnOperationChange(formcontrol: string) {
    this.mappedApiInputItems = [];
    const operation: string = this.editForm.get([formcontrol]).value;
    const action = this.editForm.get([formcontrol]).value;

    if (operation === 'FILE_READER') {
      const bodyparam: APIInput = {
        paramType: APIParamType.FILE,
      };
      this.mappedApiInputItems.push({ label: 'FILE', value: bodyparam });
    } else if (operation === 'MESSAGE_SUBSCRIBER') {
      const bodyparam: APIInput = {
        paramType: APIParamType.MESSAGE,
      };
      this.mappedApiInputItems.push({ label: 'MESSAGE', value: bodyparam });
    } else if (operation === 'SERVICE_CALL') {
      const bodyparam: APIInput = {
        paramType: APIParamType.RESPONSE,
      };
      this.mappedApiInputItems.push({ label: 'RESPONSE', value: bodyparam });
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

  addMappingRow() {
    const workflowInput = this.editForm.get(['workflowInput']).value;
    const mappedApiInput = this.editForm.get(['mappedApiInput']).value;

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

  onReturnObjChange() {
    const returnObjType = this.editForm.get(['returnRecordType']).value;
    if (returnObjType !== 's' && returnObjType !== 'm') {
      this.editForm.get('returnRecordType').patchValue('s', { emitEvent: true });
    }
  }

  // loadUpdateForm() {
  //   const obj = JSON.parse(this.rowData);
  //   this.currentTask = obj;
  //   this.updateForm(obj);
  // }

  loadEvents() {
    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i].status === 'ENABLED') {
        const dropdownLabel = this.events[i].name;
        this.eventItems.push({ label: dropdownLabel, value: this.events[i] });
      }
    }
  }

  loadAggregates() {
    for (let i = 0; i < this.aggregates.length; i++) {
      if (this.aggregates[i].status === 'ENABLED') {
        const dropdownLabel = this.aggregates[i].name;
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
        this.filetargetItems.push({ label: dropdownLabel, value: input });
      }
    }
  }

  loadViewmodels() {
    for (let i = 0; i < this.viewmodels.length; i++) {
      if (this.viewmodels[i].status === 'ENABLED') {
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
        const dropdownLabel = this.viewmodels[i].name;
        this.items.push({ label: dropdownLabel, value: input });
        this.returnItems.push({ label: dropdownLabel, value: returnObj });
        this.filetargetItems.push({ label: dropdownLabel, value: input });
      }
    }
  }

  addPrimitiveForTargetInput() {
    const dropdownLabelText = 'TEXT';
    const stringReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.BODY,
      inputType: APIInputType.TEXT,
      inputName: '_s',
    };
    const dropdownLabelNumber = 'NUMBER';
    const intReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.BODY,
      inputType: APIInputType.NUMBER,
      inputName: '_i',
    };
    const dropdownLabelFloat = 'FLOAT';
    const floatReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.BODY,
      inputType: APIInputType.FLOAT,
      inputName: '_f',
    };
    const dropdownLabelBoolean = 'TRUE_OR_FALSE';
    const boolReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.BODY,
      inputType: APIInputType.TRUE_OR_FALSE,
      inputName: '_b',
    };
    const dropdownLabelDate = 'DATE';
    const dateReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.BODY,
      inputType: APIInputType.DATE,
      inputName: '_t',
    };
    this.filetargetItems.push({ label: dropdownLabelText, value: stringReturnObj });
    this.filetargetItems.push({ label: dropdownLabelNumber, value: intReturnObj });
    this.filetargetItems.push({ label: dropdownLabelFloat, value: floatReturnObj });
    this.filetargetItems.push({ label: dropdownLabelBoolean, value: boolReturnObj });
    this.filetargetItems.push({ label: dropdownLabelDate, value: dateReturnObj });
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
    const paramType = this.editForm.get(['paramType']).value;
    const paramName = this.editForm.get(['paramName']).value;
    const paramDataType = this.editForm.get(['paramDataType']).value;

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
    }
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
    const operation = this.editForm.get(['operation']).value;
    if (operation === 'FILE_READER') {
      this.workflowMapItemsOnOperationChange('operation');
    } else if (operation === 'MESSAGE_SUBSCRIBER') {
      this.workflowMapItemsOnOperationChange('operation');
    } else if (operation === 'SERVICE_CALL') {
      this.workflowMapItemsOnOperationChange('action');
    } else {
      this.mappedApiInputItems = [];
      this.workflowMapParamChange();
    }
  }

  updateForm(task: ITask) {
    let event: IEvent;

    const operation: string = task.operation;

    if (operation === 'MESSAGE_SUBSCRIBER') {
      if (task.event) {
        event = this.events.find(item => item.uuid === task.event.uuid);
      } else {
        event = task.event;
      }

      let subrule: ISubrule;
      if (task.subruleuuid) {
        subrule = this.allSubRules.find(item => item.uuid === task.subruleuuid);
        if (subrule) {
          for (let i = 0; i < subrule.params.length; i++) {
            const dropdownLabel = subrule.params[i].paramName;
            this.workflowInputItems.push({ label: dropdownLabel, value: subrule.params[i] });
          }
        }
      }
      if (task.subruleMapping) {
        this.worlflowMappings = task.subruleMapping;
      }

      this.editForm.patchValue({
        id: task.uuid,
        selectedEvent: event,
        operation: task.operation,
        frequency: task.frequency,
        name: task.name,
        description: task.description,
        subject: task.subject,
        timeUnit: task.timeUnit,
        time: task.time,
        selectedSubrule: subrule,
      });
    } else if (operation === 'FILE_READER') {
      let subrule: ISubrule;
      if (task.subruleuuid) {
        subrule = this.allSubRules.find(item => item.uuid === task.subruleuuid);
        if (subrule) {
          for (let i = 0; i < subrule.params.length; i++) {
            const dropdownLabel = subrule.params[i].paramName;
            this.workflowInputItems.push({ label: dropdownLabel, value: subrule.params[i] });
          }
        }
      }
      if (task.subruleMapping) {
        this.worlflowMappings = task.subruleMapping;
      }

      this.editForm.patchValue({
        id: task.uuid,
        operation: task.operation,
        frequency: task.frequency,
        // fileType: task.fileType,
        fileLocation: task.fileLocation,
        name: task.name,
        description: task.description,
        timeUnit: task.timeUnit,
        time: task.time,
        fileinput: task.targetInput,
        selectedSubrule: subrule,
      });
    } else if (operation === 'SERVICE_CALL') {
      if (task.params) {
        this.apiParams = task.params;
      }

      let subrule: ISubrule;
      if (task.subruleuuid) {
        subrule = this.allSubRules.find(item => item.uuid === task.subruleuuid);
        if (subrule) {
          for (let i = 0; i < subrule.params.length; i++) {
            const dropdownLabel = subrule.params[i].paramName;
            this.workflowInputItems.push({ label: dropdownLabel, value: subrule.params[i] });
          }
        }
      }
      if (task.subruleMapping) {
        this.worlflowMappings = task.subruleMapping;
      }

      this.editForm.patchValue({
        id: task.uuid,
        operation: task.operation,
        frequency: task.frequency,
        serviceCallType: task.serviceCallType,
        url: task.url,
        action: task.action,
        targetInput: task.targetInput,
        returnObj: task.returnObj,
        returnRecordType: task.returnRecordType,
        name: task.name,
        description: task.description,
        timeUnit: task.timeUnit,
        time: task.time,
        selectedSubrule: subrule,
      });
    } else if (operation === 'GENERAL') {
      if (task.params) {
        this.apiParams = task.params;
      }

      let subrule: ISubrule;
      if (task.subruleuuid) {
        subrule = this.allSubRules.find(item => item.uuid === task.subruleuuid);
        if (subrule) {
          for (let i = 0; i < subrule.params.length; i++) {
            const dropdownLabel = subrule.params[i].paramName;
            this.workflowInputItems.push({ label: dropdownLabel, value: subrule.params[i] });
          }
        }
      }
      if (task.subruleMapping) {
        this.worlflowMappings = task.subruleMapping;
      }

      this.editForm.patchValue({
        id: task.uuid,
        operation: task.operation,
        frequency: task.frequency,
        description: task.description,
        name: task.name,
        timeUnit: task.timeUnit,
        time: task.time,
        selectedSubrule: subrule,
      });
    }
  }

  onEventChange() {
    const event = this.editForm.get(['selectedEvent']).value;
    const eventTrimmed = event.name.replace(/\s/g, '');
    const subject = this.titleCaseWord(eventTrimmed);

    this.editForm.get('subject').patchValue(subject, { emitEvent: false });
  }

  titleCaseWord(word: string) {
    if (!word) return word;
    return word[0].toUpperCase() + word.substr(1);
  }

  previousState() {
    this.dialogRef.close();
  }

  save() {
    // this.spinnerService.show();
    this.isSaving = true;

    const task = this.createFromForm();

    if (task.uuid) {
      task.status = this.currentTask.status;
      this.subscribeToSaveResponse(this.taskService.update(task, this.projectUid));
    } else {
      this.subscribeToSaveResponse(this.taskService.create(task, this.projectUid));
    }
  }

  private createFromForm(): ITask {
    const operation: string = this.editForm.get(['operation']).value;
    if (operation === 'MESSAGE_SUBSCRIBER') {
      return {
        ...new Task(),
        uuid: this.editForm.get(['id']).value,
        description: this.editForm.get(['description']).value,
        operation: this.editForm.get(['operation']).value,
        event: this.editForm.get(['selectedEvent']).value,
        name: this.editForm.get(['name']).value,
        subject: this.editForm.get(['subject']).value,
        frequency: this.editForm.get(['frequency']).value,
        timeUnit: this.editForm.get(['timeUnit']).value,
        time: this.editForm.get(['time']).value,
        projectUuid: this.projectUid,
        subruleMapping: this.worlflowMappings,
        subruleuuid: this.editForm.get(['selectedSubrule']).value.uuid,
        createWorkflow: this.editForm.get(['createWorkflow']).value,
      };
    } else if (operation === 'FILE_READER') {
      const taskData = {
        ...new Task(),
        uuid: this.editForm.get(['id']).value,
        description: this.editForm.get(['description']).value,
        operation: this.editForm.get(['operation']).value,
        // fileType: this.editForm.get(['fileType']).value,
        fileLocation: this.editForm.get(['fileLocation']).value,
        name: this.editForm.get(['name']).value,
        frequency: this.editForm.get(['frequency']).value,
        timeUnit: this.editForm.get(['timeUnit']).value,
        time: this.editForm.get(['time']).value,
        targetInput: this.editForm.get(['fileinput']).value,
        projectUuid: this.projectUid,
        subruleMapping: this.worlflowMappings,
        createWorkflow: this.editForm.get(['createWorkflow']).value,
      };
      if (!this.editForm.get(['createWorkflow']).value && this.editForm.get(['selectedSubrule']).value) {
        taskData.subruleuuid = this.editForm.get(['selectedSubrule']).value.uuid;
      }
      return taskData;
    } else if (operation === 'SERVICE_CALL') {
      const taskData = {
        ...new Task(),
        uuid: this.editForm.get(['id']).value,
        description: this.editForm.get(['description']).value,
        operation: this.editForm.get(['operation']).value,
        name: this.editForm.get(['name']).value,
        serviceCallType: this.editForm.get(['serviceCallType']).value,
        url: this.editForm.get(['url']).value,
        action: this.editForm.get(['action']).value,
        targetInput: this.editForm.get(['targetInput']).value,
        returnObj: this.editForm.get(['returnObj']).value,
        returnRecordType: this.editForm.get(['returnRecordType']).value,
        params: this.apiParams,
        frequency: this.editForm.get(['frequency']).value,
        timeUnit: this.editForm.get(['timeUnit']).value,
        time: this.editForm.get(['time']).value,
        projectUuid: this.projectUid,
        subruleMapping: this.worlflowMappings,
        createWorkflow: this.editForm.get(['createWorkflow']).value,
      };
      if (!this.editForm.get(['createWorkflow']).value && this.editForm.get(['selectedSubrule']).value) {
        taskData.subruleuuid = this.editForm.get(['selectedSubrule']).value.uuid;
      }
      return taskData;
    } else {
      const taskData = {
        ...new Task(),
        uuid: this.editForm.get(['id']).value,
        description: this.editForm.get(['description']).value,
        operation: this.editForm.get(['operation']).value,
        name: this.editForm.get(['name']).value,
        frequency: this.editForm.get(['frequency']).value,
        timeUnit: this.editForm.get(['timeUnit']).value,
        time: this.editForm.get(['time']).value,
        projectUuid: this.projectUid,
        subruleMapping: this.worlflowMappings,
        createWorkflow: this.editForm.get(['createWorkflow']).value,
      };
      if (!this.editForm.get(['createWorkflow']).value && this.editForm.get(['selectedSubrule']).value) {
        taskData.subruleuuid = this.editForm.get(['selectedSubrule']).value.uuid;
      }
      return taskData;
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITask>>) {
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

  trackProjectById(index: number, item: IProject) {
    return item.projectUuid;
  }

}
