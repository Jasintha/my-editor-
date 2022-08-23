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
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'virtuan-event-publisher-node-config',
  templateUrl: './event-publisher-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EventPublisherNodeConfigComponent),
    multi: true
  }]
})
export class EventPublisherNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  allConnectionProperties: any[];

  @Input()
  disabled: boolean;

  @Input()
  ruleNodeId: string;

  @Input()
  allEvents: any[];

  @Input()
  allModelProperties: any[];

  @Input()
  allConstants: any[];

  @Input()
  allRuleInputs: any[];

  @Input()
  allSubRules: any[];

  @Input()
  inputEntities: any[];

  @Input()
  inputCustomobjects: any[];

  @Input() branchAvailability: any;

  errordatasource: MatTableDataSource<ErrorFunctionParameters>;
  displayErroredColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

  nodeDefinitionValue: RuleNodeDefinition;

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

  eventPublisherNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.eventPublisherNodeConfigFormGroup = this.fb.group({
    //  eventSource: [],
      subject: [],
      event: [],
      inputType: "",
      modelType: "",
      entity: "",
      customObject: "",
      constant: [],
      param: [],
      property: [],
      branchparam: [],
      esConnection: [],
      errorMsg: "",
      errorAction: "",
      errorBranch: [],
      errorInputType: [],
      errorIsAsync: false,
      errorBranchparameter: [],
      errorParameterinputType: [],
      errorParameterparam: [],
      errorParameterproperty: [],
      errorParameterbranchparam: []
    });
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
    }
  }

  refreshModelTypes(){
    let modelType: string = this.eventPublisherNodeConfigFormGroup.get('modelType').value;
    this.configuration.modelType= modelType;
    if(modelType === 'MODEL'){
        this.configuration.dtoName= "";
        this.eventPublisherNodeConfigFormGroup.get('customObject').patchValue(null, {emitEvent: false});
    } else if (modelType === 'DTO'){
        this.configuration.modelName= "";
        this.eventPublisherNodeConfigFormGroup.get('entity').patchValue(null, {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }
  }

  onCustomObjSelect(){
    let customObject = this.eventPublisherNodeConfigFormGroup.get('customObject').value;
    this.configuration.dtoName= customObject.nameTitleCase;
  }

  onEntitySelect(){
    let entity = this.eventPublisherNodeConfigFormGroup.get('entity').value;
    this.configuration.modelName= entity.nameTitleCase;
  }

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.eventPublisherNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.eventPublisherNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  refreshErrorParameterInputTypes(){
    let errorInputType: string = this.eventPublisherNodeConfigFormGroup.get('errorParameterinputType').value;
    this.configuration.errorParameterinputType = errorInputType;
    if (errorInputType === 'RULE_INPUT'){
      this.configuration.errorParameterproperty= {};
      this.configuration.errorParameterbranchparam= {};
      this.eventPublisherNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'PROPERTY'){
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterbranchparam= {};
      this.eventPublisherNodeConfigFormGroup.get('parameterbranchparam').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'BRANCH_PARAM'){
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterproperty= {};
      this.eventPublisherNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'ERROR'){
      this.configuration.errorParameterbranchparam= {};
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterproperty= {};
      this.eventPublisherNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  deleteErrorRow(index: number): void{
    this.configuration.errorFunctionParameters.splice(index, 1);
    this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);
    this.updateModel(this.configuration);
  }

  addErrorParameter(): void{

    let errorInputType: string = this.eventPublisherNodeConfigFormGroup.get('errorParameterinputType').value;
    let errorBranchparameter = this.eventPublisherNodeConfigFormGroup.get('errorBranchparameter').value;

    if (errorInputType === 'RULE_INPUT'){
      let selectedErrorParameterParam = this.eventPublisherNodeConfigFormGroup.get('errorParameterparam').value;
      let errorParameter = {
        'parameterName': errorBranchparameter.paramName,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterParam.inputName
      };
      this.configuration.errorFunctionParameters.push(errorParameter);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'PROPERTY'){
      let selectedErrorParameterProperty = this.eventPublisherNodeConfigFormGroup.get('errorParameterproperty').value;
      let errorParameterproperty = {
        'parameterName': errorBranchparameter.paramName,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterProperty.name
      };
      this.configuration.errorFunctionParameters.push(errorParameterproperty);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'BRANCH_PARAM'){
      let selectedErrorParameterBranch = this.eventPublisherNodeConfigFormGroup.get('errorParameterbranchparam').value;
      let errorParameterbranchparam = {
        'parameterName': errorBranchparameter.paramName,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterBranch.name
      };
      this.configuration.errorFunctionParameters.push(errorParameterbranchparam);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'ERROR'){
      let errString = {
        'parameterName': errorBranchparameter.paramName,
        'inputType': errorInputType,
        'input': '-',
        'property': ''
      };
      this.configuration.errorFunctionParameters.push(errString);
      this.updateModel(this.configuration);
    }

    this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);

    this.configuration.errorParameterinputType = '';
    this.configuration.errorParameterproperty= {};
    this.configuration.errorParameterparam= {};
    this.configuration.errorBranchparameter= {};
    this.configuration.errorParameterbranchparam= {};

    this.eventPublisherNodeConfigFormGroup.get('errorParameterinputType').patchValue([], {emitEvent: false});
    this.eventPublisherNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
    this.eventPublisherNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
    this.eventPublisherNodeConfigFormGroup.get('errorBranchparameter').patchValue([], {emitEvent: false});
    this.eventPublisherNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});

  }
  
  refreshInputTypes(){
    let inputType: string = this.eventPublisherNodeConfigFormGroup.get('inputType').value;
    this.configuration.inputType = inputType;

     if (inputType === 'CONSTANT'){
      this.configuration.param= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      
      this.eventPublisherNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      
    } else if (inputType === 'RULE_INPUT'){
      this.configuration.constant= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      
      this.eventPublisherNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.branchparam= {};
      this.eventPublisherNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.property= {};
      this.eventPublisherNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);

    if(this.configuration.errorFunctionParameters === null || this.configuration.errorFunctionParameters === undefined){
      this.configuration.errorFunctionParameters = [];
    }
    this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);

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

      let param = this.configuration.param;
      if(this.configuration.inputType === 'RULE_INPUT' && this.allRuleInputs){
        param = this.allRuleInputs.find(x => x.inputName === this.configuration.param.inputName );
      }

      let constant = this.configuration.constant;
      if(this.configuration.inputType === 'CONSTANT' && this.allConstants){
        constant = this.allConstants.find(x => x.constantName === this.configuration.constant.constantName );
      }

      let property = this.configuration.property;
      if(this.configuration.inputType === 'PROPERTY' && this.allModelProperties){
        property = this.allModelProperties.find(x => x.name === this.configuration.property.name );
      }

      let branchparam = this.configuration.branchparam;
      if(this.configuration.inputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams){
        branchparam = this.branchAvailability.branchParams.find(x => x.name === this.configuration.branchparam.name );
      }

      let esConnection = this.configuration.esConnection;
      if(this.configuration.esConnection){
        esConnection = this.allModelProperties.find(x => x.name === this.configuration.esConnection.name );
      }
      
      let errorBranch = this.configuration.errorBranch;
      if(errorBranch && this.allSubRules){
        errorBranch = this.allSubRules.find(x => x.name === this.configuration.errorBranch.name );
      }

      let entity = this.configuration.entity;
      if(entity && this.inputEntities){
        entity = this.inputEntities.find(x => x.nameTitleCase === this.configuration.modelName );
      }

      let customObject = this.configuration.customObject;
      if(customObject && this.inputCustomobjects){
        customObject = this.inputCustomobjects.find(x => x.nameTitleCase === this.configuration.dtoName );
      }

      let e = this.configuration.event;
     // e = this.allEvents.find(x => x.name === this.configuration.event);

      this.eventPublisherNodeConfigFormGroup.patchValue({
      //  eventSource: this.configuration.eventSource,
        modelType: this.configuration.modelType,
        customObject: customObject,
        entity: entity,
        inputType: this.configuration.inputType,
        esConnection: esConnection,
        subject: this.configuration.subject,
        event: this.configuration.event,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
        param: param,
        constant: constant,
        branchparam: branchparam,
        property: property,
        errorBranch: errorBranch,
        errorInputType: this.configuration.errorInputType,
        errorBranchparameter: this.configuration.errorBranchparameter,
        errorParameterinputType: this.configuration.errorParameterinputType,
        errorParameterparam: this.configuration.errorParameterparam,
        errorParameterproperty: this.configuration.errorParameterproperty,
        errorParameterbranchparam: this.configuration.errorParameterbranchparam,
        errorIsAsync: this.configuration.errorIsAsync
      });

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('errorIsAsync').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorIsAsync = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('errorBranch').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorBranch = configuration;

            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('errorParameterparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('errorParameterbranchparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterbranchparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('errorParameterproperty').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterproperty = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('event').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.event = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('param').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.param = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('constant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.constant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('property').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.property = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('branchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.branchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

    /*
      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('eventSource').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.eventSource = configuration;
          this.updateModel(this.configuration);
        }
      );
    */
      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('subject').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.subject = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('esConnection').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.esConnection = configuration;
          this.updateModel(this.configuration);
        }
      );
    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.eventPublisherNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface ErrorFunctionParameters {
  parameterName: string;
  inputType: string;
  input: string;
  property: string;
}