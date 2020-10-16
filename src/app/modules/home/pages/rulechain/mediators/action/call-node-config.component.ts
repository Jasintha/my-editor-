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

@Component({
  selector: 'tb-call-node-config',
  templateUrl: './call-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CallNodeConfigComponent),
    multi: true
  }]
})
export class CallNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  inputEntities: any[];

  @Input()
  allVariables: any[];

  @Input()
  inputProperties: any[];

  @Input()
  allConstants: any[];

  @Input()
  inputCustomobjects: any[];

  @Input()
  allModelProperties: any[];

  @Input() branchAvailability: any;

  @Input()
  apptype: string;

    domainModelProperties: any[];
    viewModelProperties: any[];

  @Input()
  disabled: boolean;

  @Input()
  ruleNodeId: string;

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

  callNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;
  
  selectedVariableProperties: any[];
  selectedVariablePropertiesForParameter: any[];
  
  targetdatasource: MatTableDataSource<Target>;
  calldatasource: MatTableDataSource<CallProperty>;

  displayedColumns: string[] = ['targetType', 'targetName', 'inputType', 'input', 'property', 'actions'];
  calldisplayedColumns: string[] = ['name', 'value', 'actions'];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.callNodeConfigFormGroup = this.fb.group({
      url: "",
      callAction: "",
      targetParameterType: "",
      targetName: "",
      targetinputType: [],
      targetparam: [],
      targetconstant: [],
      calltargetproperty: [],
      callName: "",
      callValue: "",
      callreturnrecord: "",
      callreturninputType: [],
      callreturnentity: [],
      callreturncustomObject: [],
      calltargetbranchparam: [],
      errorMsg: "",
      errorAction: "",
      assignedProperty: []
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
  
  refreshTargetInputTypes(){

    let inputType: string = this.callNodeConfigFormGroup.get('targetinputType').value;
    this.configuration.targetinputType = inputType;
    if (inputType === 'CONSTANT'){
      this.configuration.targetparam= {};
      this.configuration.calltargetproperty= {};
      this.configuration.calltargetbranchparam= {};
      this.callNodeConfigFormGroup.get('targetparam').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('calltargetproperty').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('calltargetbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PARAM'){
      this.configuration.targetconstant= {};
      this.configuration.calltargetproperty= {};
      this.configuration.calltargetbranchparam= {};
      this.callNodeConfigFormGroup.get('targetconstant').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('calltargetproperty').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('calltargetbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.targetconstant= {};
      this.configuration.targetparam= {};
      this.configuration.calltargetbranchparam= {};
      this.callNodeConfigFormGroup.get('targetconstant').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('targetparam').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('calltargetbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.targetconstant= {};
      this.configuration.targetparam= {};
      this.configuration.calltargetproperty= {};
      this.callNodeConfigFormGroup.get('targetconstant').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('targetparam').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('calltargetproperty').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  addTarget(): void{

    let inputType: string = this.callNodeConfigFormGroup.get('targetinputType').value;
    let targetParameterType: string = this.callNodeConfigFormGroup.get('targetParameterType').value;
    let targetName: string = this.callNodeConfigFormGroup.get('targetName').value;
    
    if (inputType === 'PARAM'){
      let selectedTargetParam = this.callNodeConfigFormGroup.get('targetparam').value;
      let targetparameter = {
        'targetType': targetParameterType,
        'targetName': targetName,
        'inputType': inputType,
        'input': '-',
        'property': selectedTargetParam.inputName
      };
      this.configuration.callTargets.push(targetparameter);
      this.updateModel(this.configuration);
    } else if (inputType === 'PROPERTY'){
      let selectedTargetProperty = this.callNodeConfigFormGroup.get('calltargetproperty').value;
      let calltargetproperty = {
        'targetType': targetParameterType,
        'targetName': targetName,
        'inputType': inputType,
        'input': '-',
        'property': selectedTargetProperty.name
      };
      this.configuration.callTargets.push(calltargetproperty);
      this.updateModel(this.configuration);
    } else if (inputType === 'CONSTANT'){
      let selectedTargetConstant = this.callNodeConfigFormGroup.get('targetconstant').value;
      let targetconstant = {
        'targetType': targetParameterType,
        'targetName': targetName,
        'inputType': inputType,
        'input': '-',
        'property': selectedTargetConstant.constantName
      };
      this.configuration.callTargets.push(targetconstant);
      this.updateModel(this.configuration);
    } else if (inputType === 'BRANCH_PARAM'){
      let selectedTargetBranchParam = this.callNodeConfigFormGroup.get('calltargetbranchparam').value;
      let calltargetbranchparam = {
        'targetType': targetParameterType,
        'targetName': targetName,
        'inputType': inputType,
        'input': '-',
        'property': selectedTargetBranchParam.name
      };
      this.configuration.callTargets.push(calltargetbranchparam);
      this.updateModel(this.configuration);
    }
    
    this.targetdatasource = new MatTableDataSource(this.configuration.callTargets);

    this.configuration.targetinputType = '';
    this.configuration.targetParameterType= '';
    this.configuration.targetName= '';
    this.configuration.targetparam= {};
    this.configuration.calltargetproperty= {};
    this.configuration.targetconstant= {};
    this.configuration.calltargetbranchparam= {};

    this.callNodeConfigFormGroup.get('targetinputType').patchValue('', {emitEvent: false});
    this.callNodeConfigFormGroup.get('targetParameterType').patchValue('', {emitEvent: false});
    this.callNodeConfigFormGroup.get('targetName').patchValue('', {emitEvent: false});
    this.callNodeConfigFormGroup.get('targetparam').patchValue([], {emitEvent: false});
    this.callNodeConfigFormGroup.get('calltargetproperty').patchValue([], {emitEvent: false});
    this.callNodeConfigFormGroup.get('targetconstant').patchValue([], {emitEvent: false});
    this.callNodeConfigFormGroup.get('calltargetbranchparam').patchValue([], {emitEvent: false});

  }

  deleteRow(index: number): void{
    this.configuration.callTargets.splice(index, 1);
    this.targetdatasource = new MatTableDataSource(this.configuration.callTargets);
    this.updateModel(this.configuration);
  }

  addCallProperties(): void{
    let callName: string = this.callNodeConfigFormGroup.get('callName').value;
    let callValue: string = this.callNodeConfigFormGroup.get('callValue').value;

    let callproperty = {
        'name': callName,
        'value': callValue
    };

    this.configuration.callProperties.push(callproperty);
    this.updateModel(this.configuration);
    this.calldatasource = new MatTableDataSource(this.configuration.callProperties);
    this.callNodeConfigFormGroup.get('callName').patchValue('', {emitEvent: false});
    this.callNodeConfigFormGroup.get('callValue').patchValue('', {emitEvent: false});

  }

  deleteCallPropertyRow(index: number): void{
    this.configuration.callProperties.splice(index, 1);
    this.calldatasource = new MatTableDataSource(this.configuration.callProperties);
    this.updateModel(this.configuration);
  }

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.callNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.callNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    
    if(this.configuration.callTargets){
    } else {
        this.configuration.callTargets = [];
    }
    
    if(this.configuration.callProperties){
    } else {
        this.configuration.callProperties = [];
    }
    
    this.targetdatasource = new MatTableDataSource(this.configuration.callTargets);
    this.calldatasource = new MatTableDataSource(this.configuration.callProperties);
    
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

      let customObject = this.configuration.callreturncustomObject;
      if(customObject){
        customObject = this.inputCustomobjects.find(x => x.name === this.configuration.callreturncustomObject.name );
      }

      let entity = this.configuration.callreturnentity;
      if(entity){
        entity = this.inputEntities.find(x => x.name === this.configuration.callreturnentity.name );
      }

      let assignedProperty = this.configuration.assignedProperty;
      if(assignedProperty && this.allModelProperties){
        assignedProperty = this.allModelProperties.find(x => x.name === this.configuration.assignedProperty.name );
      }

      this.callNodeConfigFormGroup.patchValue({
        url: this.configuration.url,
        callAction: this.configuration.callAction,
        targetParameterType: this.configuration.targetParameterType,
        targetName: this.configuration.targetName,
        targetinputType: this.configuration.targetinputType,
        targetparam: this.configuration.targetparam,
        targetconstant: this.configuration.targetconstant,
        calltargetproperty: this.configuration.calltargetproperty,
        callName: this.configuration.callName,
        callValue: this.configuration.callValue,
        callreturnrecord: this.configuration.callreturnrecord,
        callreturninputType: this.configuration.callreturninputType,
        callreturnentity: entity,
        callreturncustomObject: customObject,
        calltargetbranchparam: this.configuration.calltargetbranchparam,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
        assignedProperty: assignedProperty
      });

      this.changeSubscription = this.callNodeConfigFormGroup.get('assignedProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedProperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('url').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.url = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('callAction').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.callAction = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('targetParameterType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.targetParameterType = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('targetName').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.targetName = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('targetparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.targetparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('calltargetproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.calltargetproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('targetconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.targetconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('callName').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.callName = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.callNodeConfigFormGroup.get('callValue').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.callValue = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.callNodeConfigFormGroup.get('callreturnrecord').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.callreturnrecord = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('calltargetbranchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.calltargetbranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.callNodeConfigFormGroup.get('callreturninputType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.callreturninputType = configuration;
          if(this.configuration.callreturninputType == 'MODEL'){
            this.configuration.callreturncustomObject= {};
            this.callNodeConfigFormGroup.get('callreturncustomObject').patchValue([], {emitEvent: false});
          }else if (this.configuration.callreturninputType == 'DTO'){
            this.configuration.callreturnentity= {};
            this.callNodeConfigFormGroup.get('callreturnentity').patchValue([], {emitEvent: false});
          } 
          
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.callNodeConfigFormGroup.get('callreturncustomObject').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.callreturncustomObject = configuration;
          this.configuration.callreturnentity = {};
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('callreturnentity').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.callreturnentity = configuration;
          this.configuration.callreturncustomObject = {};
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.callNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {
          console.log(configuration);
          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.callNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface Target {
  targetType: string;
  targetName: string;
  inputType: string;
  input: string;
  property: string;
}

export interface CallProperty {
  name: string;
  value: string;
}