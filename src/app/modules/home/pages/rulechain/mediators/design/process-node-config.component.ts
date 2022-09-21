import {
  AfterViewInit,
  Component,
  ComponentRef,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  EventEmitter,
  ViewChild,
  Inject,
  ViewContainerRef
} from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators, AbstractControl } from '@angular/forms';
import {
  IRuleNodeConfigurationComponent,
  RuleNodeConfiguration,
  RuleNodeDefinition
} from '@shared/models/rule-node.models';
import { Subscription } from 'rxjs';
import { RuleChainService } from '@core/http/rule-chain.service';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { TranslateService } from '@ngx-translate/core';
import { JsonObjectEditComponent } from '@shared/components/json-object-edit.component';
import { deepClone } from '@core/utils';
import {APIInput, APIInputType, APIParamType, IAPIInput, IWorkflowMapping} from '@shared/models/model/api-input.model';
import {IProject} from '@shared/models/model/project.model';
import {IApi} from '@shared/models/model/microservice-api.model';
import {IDatamodel} from '@shared/models/model/datamodel.model';
import {ICustomObject} from '@shared/models/model/custom-object.model';
import {IAggregate} from '@shared/models/model/aggregate.model';
import {IEvent} from '@shared/models/model/microservice-event.model';
import {IViewmodel} from '@shared/models/model/viewmodel.model';
import {ISubrule} from '@shared/models/model/subrule.model';
import {filter, map} from 'rxjs/operators';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {ICommand} from '@shared/models/model/command.model';
import {IQuery} from '@shared/models/model/query.model';
import { AggregateService } from '@core/projectservices/microservice-aggregate.service';
import {ProjectService} from '@core/projectservices/project.service';
interface Item {
  value: any;
  label: string;
}
@Component({
  selector: 'virtuan-process-node-config',
  templateUrl: './process-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ProcessNodeConfigComponent),
    multi: true
  }]
})
export class ProcessNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

  @ViewChild('definedConfigContent', {read: ViewContainerRef, static: true}) definedConfigContainer: ViewContainerRef;

  private requiredValue: boolean;
  get required(): boolean {
    return this.requiredValue;
  }
  @Input()
  set required(value: boolean) {
    this.requiredValue = coerceBooleanProperty(value);
  }

  @Input()
  disabled: boolean;

  @Input()
  allActors: any[];

  @Input()
  serviceUuid: string;

  @Input()
  ruleNodeId: string;

  @Input()
  allMicroservices: any[];

  apiItems: any[];
  filetargetItems: any[];

  nodeDefinitionValue: RuleNodeDefinition;

  fileinput: any = {
    id: '',
    paramType: APIParamType.BODY,
    inputType: APIInputType.FILE,
    inputName: 'file',
  };

  frequencyItems: Item[] = [
    { label: 'Single', value: 'SINGLE' },
    { label: 'Multiple', value: 'MULTIPLE' },
  ];

  timeUnitItems: Item[] = [
    { label: 'Seconds', value: 's' },
    { label: 'Minutes', value: 'min' },
    { label: 'Hours', value: 'h' },
  ];

  operationItems: Item[] = [
    { label: 'General', value: 'GENERAL' },
    { label: 'Message Subscriber', value: 'MESSAGE_SUBSCRIBER' },
    { label: 'File Reader', value: 'FILE_READER' },
    { label: 'Service Call', value: 'SERVICE_CALL' },
  ];

  crudItems: any[] = ['CREATE','UPDATE','DELETE','FIND','FINDALL', 'EMPTY'];

  apiMethod: any[] = ['POST','GET','PUT','DELETE'];

//   returnRecord: any[] = ['MULTIPLE', 'SINGLE'];

  returnRecord: Item[] = [
    { label: 'Single', value: 's' },
    { label: 'Multiple', value: 'm' }
  ];
  returnObject: any[];

  isSaving: boolean;
  project: IProject;
  currentApi: IApi;
  items: Item[];
  // returnItems: Item[];
  aggregates: IAggregate[];
  apiParams: APIInput[];
  aggregateItems: Item[];
  editType: string;
  apiStyle: string;

  @Input()
  set nodeDefinition(nodeDefinition: RuleNodeDefinition) {
    if (this.nodeDefinitionValue !== nodeDefinition) {
      this.nodeDefinitionValue = nodeDefinition;
      if (this.nodeDefinitionValue) {
        // this.validateDefinedDirective();
      }
    }
  }

  get nodeDefinition(): RuleNodeDefinition {
    return this.nodeDefinitionValue;
  }

  definedDirectiveError: string;

  processNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

//   displayedColumns: string[] = ['actorName', 'permissionLevel', 'actions'];

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              protected aggregateService: AggregateService,
              protected projectService: ProjectService,
              private fb: FormBuilder) {
    this.processNodeConfigFormGroup = this.fb.group({
      processName: ['', Validators.required],
      apiTemplate: '',
      apiMethod: '',
      returnObject: '',
      returnRecord: '',
      selectedAPIInputs: null,
      existing: false,
      microservice: null,
      microserviceApi: null,
      processType: '',
      operation: '',
      frequency: '',
      timeUnit: '',
      time: 0,
      fileinput: null,
      fileLocation: '',
      subject: '',
      url: '',
    });
  }

  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
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
        this.filetargetItems.push({ label: dropdownLabel, value: input });
        this.returnObject.push({ label: dropdownLabel, value: returnObj });
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
        this.filetargetItems.push({ label: dropdownLabel, value: input });
        this.returnObject.push({ label: dropdownLabel, value: returnObj });
      }
    }
  }

  refreshMicroservices() {
    this.apiItems = [];
    const microservice = this.processNodeConfigFormGroup.get(['microservice']).value;

    this.configuration.microservice= microservice.name;
    this.configuration.microserviceUuid= microservice.masterUuid;
    this.configuration.apiresourcepath= '';
    this.updateModel(this.configuration);

    if (microservice.microserviceApis) {
      for (let i = 0; i < microservice.microserviceApis.length; i++) {
        const apiObj = {
          'apiType': 'API',
          'api': microservice.microserviceApis[i],
        };
        this.apiItems.push(apiObj);
      }
    }

    if (microservice.commands) {
      for (let i = 0; i < microservice.commands.length; i++) {
        const commandObj = {
          'apiType': 'COMMAND',
          'api': microservice.commands[i],
        };
        this.apiItems.push(commandObj);
      }
    }

    if (microservice.queries) {
      for (let i = 0; i < microservice.queries.length; i++) {
        const queryObj = {
          'apiType': 'QUERY',
          'api': microservice.queries[i],
        };
        this.apiItems.push(queryObj);
      }
    }
  }

  onChangeMicroserviceAPI() {
    const api = this.processNodeConfigFormGroup.get(['microserviceApi']).value;
    if (api) {
      const apiStart: boolean = api.resourcePath.startsWith('/');
      let suggestedPath = '';
      if (apiStart) {
        suggestedPath = api.resourcePath;
      } else {
        suggestedPath = '/' + api.resourcePath;
      }
      this.configuration.apiUuid= api.uuid;
      this.configuration.apiresourcepath= suggestedPath;
      this.updateModel(this.configuration);
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  ngOnInit(): void {
    this.isSaving = false;
    this.items = [];
    this.filetargetItems = [];
    this.apiParams = [];
    this.aggregateItems = [];
    this.returnObject = [];
    this.addPrimitivesForReturnSelect();
/*
    if (this.serviceUuid) {
      this.aggregateService
          .findByProjectUUId(this.serviceUuid, this.serviceUuid)
          .pipe(
              filter((mayBeOk: HttpResponse<any[]>) => mayBeOk.ok),
              map((response: HttpResponse<any[]>) => response.body)
          )
          .subscribe(
              (res: any[]) => {
                this.aggregates = res;
                if (this.aggregates) {
                  this.loadAggregates();
                }
              },
              (res: HttpErrorResponse) => this.onError(res.message)
          );
    } */
  }

  onInputObjChange(){
    this.configuration.apiInput = this.processNodeConfigFormGroup.get(['selectedAPIInputs']).value;
    this.updateModel(this.configuration);
  }
  onReturnObjChange(){
    this.configuration.returnObject = this.processNodeConfigFormGroup.get(['returnObject']).value;
    this.updateModel(this.configuration);
  }
  onFileInputObjChange(){
    this.configuration.fileinput = this.processNodeConfigFormGroup.get(['fileinput']).value;
    this.updateModel(this.configuration);
  }

  loadServiceAndUpdateForm(){
     if (this.serviceUuid) {
        this.projectService
            .findWithModelEventsAndSubrules(this.serviceUuid)
            .pipe(
                filter((mayBeOk: HttpResponse<IProject>) => mayBeOk.ok),
                map((response: HttpResponse<IProject>) => response.body)
            )
            .subscribe(
                (res: IProject) => {
                  this.project = res;
                  this.aggregates = this.project.aggregates;
                  this.items = [];
                  this.filetargetItems = [];

                  if (this.aggregates) {
                    this.loadAggregates();
                  }

                  if(this.items) {
                    this.items.push({ label: 'FILE', value: this.fileinput });
                  } else {
                    this.items = [];
                    this.items.push({ label: 'FILE', value: this.fileinput });
                  }

                  if(this.configuration.apiInput && this.configuration.apiInput.id && this.items){
                    if(this.configuration.apiInput.inputType !== 'FILE'){
                        let selectedAPIInputs = this.items.find(x => (x.value.id === this.configuration.apiInput.id) && (x.value.inputName === this.configuration.apiInput.inputName));
                        this.processNodeConfigFormGroup.patchValue({
                          selectedAPIInputs: selectedAPIInputs.value,
                        });
                    } else {
                        let selectedAPIInputs = this.items.find(x => (x.value.inputType === this.configuration.apiInput.inputType) && (x.value.inputName === this.configuration.apiInput.inputName));
                        this.processNodeConfigFormGroup.patchValue({
                          selectedAPIInputs: selectedAPIInputs.value,
                        });
                    }
                  }
                  if(this.configuration.returnObject && this.configuration.returnObject.id && this.returnObject){
                    let returnObject = this.returnObject.find(x => (x.value.id === this.configuration.returnObject.id) && (x.value.inputType === this.configuration.returnObject.inputType) && (x.value.inputName === this.configuration.returnObject.inputName));
                    this.processNodeConfigFormGroup.patchValue({
                      returnObject: returnObject.value
                    });
                  }
                  if(this.configuration.processType === 'TASK' && this.configuration.operation === 'FILE_READER' &&  this.configuration.fileinput){
                    let fileinput = this.filetargetItems.find(x => (x.value.id === this.configuration.fileinput.id) && (x.value.inputType === this.configuration.fileinput.inputType) && (x.value.inputName === this.configuration.fileinput.inputName));
                    this.processNodeConfigFormGroup.patchValue({
                      fileinput: fileinput.value
                    });
                  }
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
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
    if(!this.returnObject){
        this.returnObject = [];
    }

    const dropdownLabelFile = 'FILE';
    const fileReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.RETURN,
      inputType: APIInputType.FILE,
      inputName: 'file',
    };

    this.returnObject.push({ label: dropdownLabelText, value: stringReturnObj });
    this.returnObject.push({ label: dropdownLabelNumber, value: intReturnObj });
    this.returnObject.push({ label: dropdownLabelFloat, value: floatReturnObj });
    this.returnObject.push({ label: dropdownLabelBoolean, value: boolReturnObj });
    this.returnObject.push({ label: dropdownLabelDate, value: dateReturnObj });
    this.returnObject.push({ label: dropdownLabelFile, value: fileReturnObj });
//
//     this.returnItems.push(stringReturnObj );
//     this.returnItems.push( intReturnObj );
//     this.returnItems.push(floatReturnObj);
//     this.returnItems.push( boolReturnObj );
//     this.returnItems.push(dateReturnObj );
  }

  ngOnDestroy(): void {
    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
    }
  }

  ngAfterViewInit(): void {
  }


  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.processNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.processNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {
    this.configuration = deepClone(value);
    if (this.changeSubscription) {
      this.changeSubscription.unsubscribe();
      this.changeSubscription = null;
    }
    if (this.definedConfigComponent) {
      this.definedConfigComponent.configuration = this.configuration;
      this.changeSubscription = this.definedConfigComponent.configurationChanged.subscribe((configuration) => {
        this.updateModel(configuration);
      });
    } else {


      let microservice;
      let microserviceApi;
      let microserviceUuid = this.configuration.microserviceUuid;
      let microserviceResourcePath = this.configuration.apiresourcepath;
      let microserviceId = this.configuration.apiUuid;
      this.apiItems = [];
      if (this.configuration.existing && microserviceUuid && this.allMicroservices){
        microservice = this.allMicroservices.find(x => x.masterUuid === microserviceUuid );

        if (microservice && microservice.microserviceApis) {
          for (let i = 0; i < microservice.microserviceApis.length; i++) {
            const apiObj = {
              'apiType': 'API',
              'api': microservice.microserviceApis[i],
            };
            this.apiItems.push(apiObj);
          }
        }

        if (microservice && microservice.commands) {
          for (let i = 0; i < microservice.commands.length; i++) {
            const commandObj = {
              'apiType': 'COMMAND',
              'api': microservice.commands[i],
            };
            this.apiItems.push(commandObj);
          }
        }

        if (microservice && microservice.queries) {
          for (let i = 0; i < microservice.queries.length; i++) {
            const queryObj = {
              'apiType': 'QUERY',
              'api': microservice.queries[i],
            };
            this.apiItems.push(queryObj);
          }
        }

        if (microserviceId){
            let searchedmicroserviceApi = this.apiItems.find(x => x.api.uuid === microserviceId);
            if(searchedmicroserviceApi){
                microserviceApi = searchedmicroserviceApi.api;
            }
        }

      }

      if (this.configuration.processType !== 'TASK') {
        this.configuration.processType = 'API';
      }

      console.log("process type");
      console.log(this.configuration.processType);


      this.processNodeConfigFormGroup.patchValue({
        processType: this.configuration.processType,
        operation: this.configuration.operation,
        frequency: this.configuration.frequency,
        timeUnit: this.configuration.timeUnit,
        time: this.configuration.time,
        subject: this.configuration.subject,
        url: this.configuration.url,
        fileLocation: this.configuration.fileLocation,
        processName: this.configuration.processName,
        apiTemplate: this.configuration.apiTemplate,
        apiMethod: this.configuration.apiMethod,
//         returnObject: this.configuration.returnObject,
        returnRecord: this.configuration.returnRecord,
        existing: this.configuration.existing,
        microservice: microservice,
        microserviceApi: microserviceApi
      });
    }
    this.changeSubscription = this.processNodeConfigFormGroup.get('existing').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.existing = configuration;

          if(configuration){
// //             this.configuration.url = '';
//             this.configuration.param= {};
//             this.configuration.property= {};
//             this.configuration.branchparam= {};
//             this.configuration.constant= {};
//             this.configuration.inputType= '';
//             this.processNodeConfigFormGroup.get('constant').patchValue(null, {emitEvent: false});
//             this.processNodeConfigFormGroup.get('param').patchValue(null, {emitEvent: false});
//             this.processNodeConfigFormGroup.get('property').patchValue(null, {emitEvent: false});
//             this.processNodeConfigFormGroup.get('branchparam').patchValue(null, {emitEvent: false});
//             this.processNodeConfigFormGroup.get('inputType').patchValue('', {emitEvent: false});
          } else {
            this.configuration.microservice= '';
            this.configuration.microserviceUuid= '';
            this.configuration.apiresourcepath= '';
            this.processNodeConfigFormGroup.get('microservice').patchValue(null, {emitEvent: false});
            this.processNodeConfigFormGroup.get('microserviceApi').patchValue(null, {emitEvent: false});
          }
          this.updateModel(this.configuration);
        }
    );
    this.changeSubscription = this.processNodeConfigFormGroup.get('apiTemplate').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.apiTemplate = configuration;
          this.updateModel(this.configuration);
        }
    );
    this.changeSubscription = this.processNodeConfigFormGroup.get('processType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.processType = configuration;
          this.updateModel(this.configuration);
        }
    );
    this.changeSubscription = this.processNodeConfigFormGroup.get('operation').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.operation = configuration;
          this.updateModel(this.configuration);
        }
    );

    this.changeSubscription = this.processNodeConfigFormGroup.get('frequency').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.frequency = configuration;
          this.updateModel(this.configuration);
        }
    );
    this.changeSubscription = this.processNodeConfigFormGroup.get('timeUnit').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.timeUnit = configuration;
          this.updateModel(this.configuration);
        }
    );
    this.changeSubscription = this.processNodeConfigFormGroup.get('time').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.time = configuration;
          this.updateModel(this.configuration);
        }
    );

    this.changeSubscription = this.processNodeConfigFormGroup.get('subject').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.subject = configuration;
          this.updateModel(this.configuration);
        }
    );
    this.changeSubscription = this.processNodeConfigFormGroup.get('url').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.url = configuration;
          this.updateModel(this.configuration);
        }
    );
    this.changeSubscription = this.processNodeConfigFormGroup.get('fileLocation').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.fileLocation = configuration;
          this.updateModel(this.configuration);
        }
    );

    this.changeSubscription = this.processNodeConfigFormGroup.get('processName').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.processName = configuration;
          this.updateModel(this.configuration);
        }
    );
    this.changeSubscription = this.processNodeConfigFormGroup.get('apiMethod').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.apiMethod = configuration;
          this.updateModel(this.configuration);
        }
    );
   /*  this.changeSubscription = this.processNodeConfigFormGroup.get('returnObject').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.returnObject = configuration;
          this.updateModel(this.configuration);
        }
    ); */
    this.changeSubscription = this.processNodeConfigFormGroup.get('returnRecord').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.returnRecord = configuration;
          this.updateModel(this.configuration);
        }
    );
    this.loadServiceAndUpdateForm();
  }

  titleCaseWord(word: string) {
    if (!word) return word;
    return word[0].toUpperCase() + word.substr(1);
  }

  lowerCaseWord(word: string) {
    if (!word) return word;
    return word[0].toLowerCase() + word.substr(1);
  }

  private updateModel(configuration: RuleNodeConfiguration) {

    if (this.definedConfigComponent || this.processNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {

      this.propagateChange(this.required ? null : configuration);
    }
  }

}
