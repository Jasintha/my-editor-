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
  selector: 'tb-sub-rule-node-config',
  templateUrl: './sub-rule-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SubRuleNodeConfigComponent),
    multi: true
  }]
})
export class SubRuleNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  @Input()
  inputEntities: any[];

  @Input()
  allVariables: any[];

  @Input()
  allSubRules: any[];

  @Input()
  inputProperties: any[];

  @Input()
  allRuleInputs: any[];

  @Input()
  allConstants: any[];

  @Input()
  inputCustomobjects: any[];

  @Input()
  allModelProperties: any[];

  @Input() branchAvailability: any;

  @Input()
  apptype: string;

  @Input()
  allReferenceProperties: any[];

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

  subRuleNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;
  
  datasource: MatTableDataSource<SubRuleInput>;

  displayedColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.subRuleNodeConfigFormGroup = this.fb.group({
      subruleInput: [],
      inputType: [],
      //record: [],
      //customObject: [],
      subRule: [],
      parameterinputType: [],
      parameterparam: [],
      parameterproperty: [],
      parameterbranch: [],
      assignedProperty: [],
      errorMsg: "",
      errorAction: "",
      assignedtoinputType: "",
      parameterconstant: [],
      assignedReference: []
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

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.subRuleNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.subRuleNodeConfigFormGroup.enable({emitEvent: false});
    }
  }
  
  refreshParameterInputTypes(){
    let inputType: string = this.subRuleNodeConfigFormGroup.get('parameterinputType').value;
    this.configuration.parameterinputType = inputType;
    if (inputType === 'RULE_INPUT'){
      this.configuration.parameterproperty= {};
      this.configuration.parameterbranch= {};
      this.configuration.parameterconstant= {};
      this.subRuleNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      this.subRuleNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
      this.subRuleNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.parameterparam= {};
      this.configuration.parameterbranch= {};
      this.configuration.parameterconstant= {};
      this.subRuleNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
      this.subRuleNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
      this.subRuleNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.parameterparam= {};
      this.configuration.parameterproperty= {};
      this.configuration.parameterconstant= {};
      this.subRuleNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
      this.subRuleNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      this.subRuleNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
    } else if (inputType === 'CONSTANT'){
      this.configuration.parameterparam= {};
      this.configuration.parameterproperty= {};
      this.configuration.parameterbranch= {};
      this.subRuleNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
      this.subRuleNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      this.subRuleNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  deleteRow(index: number): void{
    this.configuration.subRuleInputs.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.subRuleInputs);
    this.updateModel(this.configuration);
  }
  
  addParameter(): void{
    /*
    let number: number = 0;

    if(this.configuration.subRuleInputs){
      number = this.configuration.subRuleInputs.length + 1;
    } else {
        this.configuration.subRuleInputs = [];
        number = this.configuration.subRuleInputs.length + 1;
    }
    */

    let inputType: string = this.subRuleNodeConfigFormGroup.get('parameterinputType').value;
    let subruleInput = this.subRuleNodeConfigFormGroup.get('subruleInput').value;
    
    if (inputType === 'RULE_INPUT'){
      let selectedParameterParam = this.subRuleNodeConfigFormGroup.get('parameterparam').value;
      let parameter = {
        'parameterName': subruleInput.paramName,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterParam.inputName
      };
      this.configuration.subRuleInputs.push(parameter);
      this.updateModel(this.configuration);
    } else if (inputType === 'PROPERTY'){
      let selectedParameterProperty = this.subRuleNodeConfigFormGroup.get('parameterproperty').value;
      let parameterproperty = {
        'parameterName': subruleInput.paramName,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterProperty.name
      };
      this.configuration.subRuleInputs.push(parameterproperty);
      this.updateModel(this.configuration);
    } else if (inputType === 'BRANCH_PARAM'){
      let selectedParameterBranch = this.subRuleNodeConfigFormGroup.get('parameterbranch').value;
      let parameterbranch = {
        'parameterName': subruleInput.paramName,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterBranch.name
      };
      this.configuration.subRuleInputs.push(parameterbranch);
      this.updateModel(this.configuration);
    } else if (inputType === 'CONSTANT'){
      let selectedParameterConstant = this.subRuleNodeConfigFormGroup.get('parameterconstant').value;
      let parameterconstant = {
        'parameterName': subruleInput.paramName,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterConstant.constantName
      };
      this.configuration.subRuleInputs.push(parameterconstant);
      this.updateModel(this.configuration);
    }

    this.datasource = new MatTableDataSource(this.configuration.subRuleInputs);

    this.configuration.parameterinputType = '';
    this.configuration.parameterproperty= {};
    this.configuration.parameterbranch= {};
    this.configuration.parameterparam= {};
    this.configuration.parameterconstant= {};
    this.configuration.subruleInput= {};
  
    this.subRuleNodeConfigFormGroup.get('parameterinputType').patchValue([], {emitEvent: false});
    this.subRuleNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
    this.subRuleNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
    this.subRuleNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
    this.subRuleNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
    this.subRuleNodeConfigFormGroup.get('subruleInput').patchValue([], {emitEvent: false});

  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    if(this.configuration.subRuleInputs === null || this.configuration.subRuleInputs === undefined){
        this.configuration.subRuleInputs = [];
    }
    this.datasource = new MatTableDataSource(this.configuration.subRuleInputs);
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

      let subRuleObj = this.configuration.subRule;
      if(subRuleObj && this.allSubRules){
        subRuleObj = this.allSubRules.find(x => x.name === this.configuration.subRule.name );
      }

      let assignedProperty = this.configuration.assignedProperty;
      if(this.configuration.assignedtoinputType === 'PROPERTY' && assignedProperty && this.allModelProperties){
        assignedProperty = this.allModelProperties.find(x => x.name === this.configuration.assignedProperty.name );
      }

      let assignedReference = this.configuration.assignedReference;
      if(this.configuration.assignedtoinputType === 'REFERENCE' && assignedReference && this.allReferenceProperties){
        assignedReference = this.allReferenceProperties.find(x => x.name === this.configuration.assignedReference.name );
      }
      /*
      let customObject = this.configuration.customObject;
      if(customObject){
        customObject = this.inputCustomobjects.find(x => x.name === this.configuration.customObject.name );
      }

      let entity = this.configuration.entity;
      if(entity){
        entity = this.inputEntities.find(x => x.name === this.configuration.entity.name );
      }
      */

      this.subRuleNodeConfigFormGroup.patchValue({
        inputType: this.configuration.inputType,
        subruleInput: this.configuration.subruleInput,
        //record: this.configuration.record,
        //customObject: customObject,
        parameterinputType: this.configuration.parameterinputType,
        parameterparam: this.configuration.parameterparam,
        parameterproperty: this.configuration.parameterproperty,
        parameterconstant: this.configuration.parameterconstant,
        parameterbranch: this.configuration.parameterbranch,
        subRule: subRuleObj,
        assignedProperty: assignedProperty,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
        assignedtoinputType: this.configuration.assignedtoinputType,
        assignedReference: assignedReference
      });

      this.changeSubscription = this.subRuleNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.subRuleNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.subRuleNodeConfigFormGroup.get('subRule').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.subRule = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.subRuleNodeConfigFormGroup.get('assignedProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedProperty = configuration;
          this.updateModel(this.configuration);
        }
      );
      /*
      this.changeSubscription = this.subRuleNodeConfigFormGroup.get('record').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.record = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.subRuleNodeConfigFormGroup.get('parameterparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.subRuleNodeConfigFormGroup.get('parameterproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.subRuleNodeConfigFormGroup.get('parameterconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.subRuleNodeConfigFormGroup.get('parameterbranch').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterbranch = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.subRuleNodeConfigFormGroup.get('assignedReference').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedReference = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.subRuleNodeConfigFormGroup.get('assignedtoinputType').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {

          this.configuration.assignedtoinputType = configuration;
          if(this.configuration.assignedtoinputType == 'PROPERTY'){
            this.configuration.assignedReference= {};
            this.subRuleNodeConfigFormGroup.get('assignedReference').patchValue([], {emitEvent: false});
          }else if (this.configuration.assignedtoinputType == 'REFERENCE'){
            this.configuration.assignedProperty= {};
            this.subRuleNodeConfigFormGroup.get('assignedProperty').patchValue([], {emitEvent: false});
          }
          this.updateModel(this.configuration);
        }
      );

    }
  }

/*
  useDefinedDirective(): boolean {
    return this.nodeDefinition &&
      (this.nodeDefinition.configDirective &&
       this.nodeDefinition.configDirective.length) && !this.definedDirectiveError;
  }
  */

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.subRuleNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

  /*

  private validateDefinedDirective() {
    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
      this.definedConfigComponentRef = null;
    }
    if (this.nodeDefinition.uiResourceLoadError && this.nodeDefinition.uiResourceLoadError.length) {
      this.definedDirectiveError = this.nodeDefinition.uiResourceLoadError;
    } else if (this.nodeDefinition.configDirective && this.nodeDefinition.configDirective.length) {
      if (this.changeSubscription) {
        this.changeSubscription.unsubscribe();
        this.changeSubscription = null;
      }
      this.definedConfigContainer.clear();
      const factory = this.ruleChainService.getRuleNodeConfigFactory(this.nodeDefinition.configDirective);
      this.definedConfigComponentRef = this.definedConfigContainer.createComponent(factory);
      this.definedConfigComponent = this.definedConfigComponentRef.instance;
      this.definedConfigComponent.ruleNodeId = this.ruleNodeId;
      this.definedConfigComponent.configuration = this.configuration;
      this.changeSubscription = this.definedConfigComponent.configurationChanged.subscribe((configuration) => {
        this.updateModel(configuration);
      });
    }
  }

  validate() {
    if (this.useDefinedDirective()) {
      this.definedConfigComponent.validate();
    }
  }
  */
}

export interface SubRuleInput {
  parameterName: string;
  inputType: string;
  input: string;
  property: string;
}

