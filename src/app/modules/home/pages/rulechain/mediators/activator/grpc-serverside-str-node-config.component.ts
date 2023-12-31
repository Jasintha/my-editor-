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
import { Observable } from 'rxjs';
import { PageComponent } from '@shared/components/page.component';
import { Store } from '@ngrx/store';
import { AppState } from '@core/core.state';
import {MatTableDataSource} from '@angular/material/table';
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
import {InputPropertyService} from '@core/projectservices/input-property.service';
import {ApiService} from '@core/projectservices/api.service';
import {CommandService} from '@core/projectservices/microservice-command.service';
import {ProjectService} from '@core/projectservices/project.service';
import {QueryService} from '@core/projectservices/microservice-query.service';

@Component({
  selector: 'virtuan-grpc-serverside-str-node-config',
  templateUrl: './grpc-serverside-str-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => GRPCServerSideStrNodeConfigComponent),
    multi: true
  }]
})
export class GRPCServerSideStrNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  ruleNodeId: string;

  nodeDefinitionValue: RuleNodeDefinition;
  
  
  isSaving: boolean;
  project: IProject;
  items: any[];
  returnItems: any[];
  aggregates: IAggregate[];
  aggregateItems: Item[];
  viewmodelItems: Item[];
  viewmodels: IViewmodel[];

  @Input()
  serviceUuid: string;

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

  grpcServerSideStrNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              protected projectService: ProjectService,
              private fb: FormBuilder) {
    this.grpcServerSideStrNodeConfigFormGroup = this.fb.group({
      selectedAPIInputs: [null, Validators.required],
      returnRecordType: "",
      returnObj: null,
      enableSecurity: false
    });
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  ngOnInit(): void {
    this.isSaving = false;
    this.items = [];
    this.returnItems = [];
    this.viewmodelItems = [];
    this.aggregateItems = [];
    this.addPrimitivesForReturnSelect();

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
                  this.viewmodels = this.project.viewmodels;
                  if (this.aggregates) {
                    this.loadAggregates();
                  }
                  if (this.viewmodels) {
                    this.loadViewmodels();
                  }

                  this.updateForm();
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
      }

  }

  updateForm(){
      let selectedAPIInputs = this.configuration.selectedAPIInputs;
      if(selectedAPIInputs && this.items){
        selectedAPIInputs = this.items.find(x => (x.id === this.configuration.selectedAPIInputs.id) && (x.inputName === this.configuration.selectedAPIInputs.inputName));
      }
      let returnObj = this.configuration.returnObj;
      if(returnObj && this.returnItems){
        returnObj = this.returnItems.find(x => (x.id === this.configuration.returnObj.id) && (x.inputType === this.configuration.returnObj.inputType) && (x.inputName === this.configuration.returnObj.inputName));
      }

      this.grpcServerSideStrNodeConfigFormGroup.patchValue({
          selectedAPIInputs: selectedAPIInputs,
          returnObj: returnObj
      });

  }

  ngOnDestroy(): void {
    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
    }
  }

  ngAfterViewInit(): void {
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
//     this.returnItems.push({ label: dropdownLabelText, value: stringReturnObj });
//     this.returnItems.push({ label: dropdownLabelNumber, value: intReturnObj });
//     this.returnItems.push({ label: dropdownLabelFloat, value: floatReturnObj });
//     this.returnItems.push({ label: dropdownLabelBoolean, value: boolReturnObj });
//     this.returnItems.push({ label: dropdownLabelDate, value: dateReturnObj });
//
    this.returnItems.push(stringReturnObj );
    this.returnItems.push( intReturnObj );
    this.returnItems.push(floatReturnObj);
    this.returnItems.push( boolReturnObj );
    this.returnItems.push(dateReturnObj );
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
//         this.items.push({ label: dropdownLabel, value: input });
        this.items.push(input);
//         this.returnItems.push({ label: dropdownLabel, value: returnObj });
        this.returnItems.push(returnObj);
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
//         this.items.push({ label: dropdownLabel, value: input });
        this.items.push(input);
//         this.returnItems.push({ label: dropdownLabel, value: returnObj });
        this.returnItems.push(returnObj);
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
//         this.items.push({ label: dtodropdownLabel, value: input });
        this.items.push(input);
//         this.returnItems.push({ label: dtodropdownLabel, value: returnObj });
        this.returnItems.push( returnObj );
      }
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.grpcServerSideStrNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.grpcServerSideStrNodeConfigFormGroup.enable({emitEvent: false});
    }
  }
  
  onReturnObjChange(){
    this.configuration.returnObj = this.grpcServerSideStrNodeConfigFormGroup.get(['returnObj']).value;
    const returnRecordType = this.configuration.returnRecordType;
    if (this.configuration.returnObj && returnRecordType !== 's' && returnRecordType !== 'm') {
      this.grpcServerSideStrNodeConfigFormGroup.get('returnRecordType').patchValue('s', { emitEvent: false });
      this.configuration.returnRecordType = 's';
    }
    this.updateModel(this.configuration);
  }  
  
  onInputObjChange(){
    this.configuration.selectedAPIInputs = this.grpcServerSideStrNodeConfigFormGroup.get(['selectedAPIInputs']).value;
    this.updateModel(this.configuration);
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
            
      this.grpcServerSideStrNodeConfigFormGroup.patchValue({
//           selectedAPIInputs: selectedAPIInputs,
          returnRecordType: this.configuration.returnRecordType,
//           returnObj: returnObj,
          enableSecurity: this.configuration.enableSecurity
      });

    this.changeSubscription = this.grpcServerSideStrNodeConfigFormGroup.get('returnRecordType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.returnRecordType = configuration;
          this.updateModel(this.configuration);
        }
    );

    this.changeSubscription = this.grpcServerSideStrNodeConfigFormGroup.get('enableSecurity').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.enableSecurity = configuration;
          this.updateModel(this.configuration);
        }
    );

    /* this.changeSubscription = this.grpcServerSideStrNodeConfigFormGroup.get('selectedAPIInputs').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.selectedAPIInputs = configuration;
          this.updateModel(this.configuration);
        }
    ); */
    
    this.loadServiceAndUpdateForm();

    }
  }

  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
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

    if (this.definedConfigComponent || this.grpcServerSideStrNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {

      this.propagateChange(this.required ? null : configuration);
    }
  }


}

export interface Constant {
  constantName: string;
  constantType: string;
  customValue: string;
  scope: string;
}

export class Parammapping {
  name?: string;
  datatype?: string;
  param?: string;
}

export interface Item {
  value: any;
  label: string;
}