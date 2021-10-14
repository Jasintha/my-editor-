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
  selector: 'virtuan-hybrid-function-node-config',
  templateUrl: './hybrid-function-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => HybridFunctionNodeConfigComponent),
    multi: true
  }]
})
export class HybridFunctionNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

  @ViewChild('definedConfigContent', {read: ViewContainerRef, static: true}) definedConfigContainer: ViewContainerRef;

  private requiredValue: boolean;
  get required(): boolean {
    return this.requiredValue;
  }

  @Input()
  allRoots: any[];

  @Input()
  allErrorBranches: any[];

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
  allHybridFunctions: any[];

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

  hybridFunctionNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;
  
  datasource: MatTableDataSource<HybridParameters>;

  displayedColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

  errordatasource: MatTableDataSource<ErrorFunctionParameters>;
  displayErroredColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.hybridFunctionNodeConfigFormGroup = this.fb.group({
      functionparameter: [],
      inputType: [],
      //record: [],
      //customObject: [],
      function: [],
      parameterinputType: [],
      parameterparam: [],
      parameterproperty: [],
      parameterbranch: [],
      assignedProperty: [],
      errorMsg: "",
      errorAction: "",
      assignedtoinputType: "",
      parameterconstant: [],
      assignedReference: [],
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

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.hybridFunctionNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.hybridFunctionNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  refreshErrorParameterInputTypes(){
    let errorInputType: string = this.hybridFunctionNodeConfigFormGroup.get('errorParameterinputType').value;
    this.configuration.errorParameterinputType = errorInputType;
    if (errorInputType === 'RULE_INPUT'){
      this.configuration.errorParameterproperty= {};
      this.configuration.errorParameterbranchparam= {};
      this.hybridFunctionNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.hybridFunctionNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'PROPERTY'){
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterbranchparam= {};
      this.hybridFunctionNodeConfigFormGroup.get('parameterbranchparam').patchValue([], {emitEvent: false});
      this.hybridFunctionNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'BRANCH_PARAM'){
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterproperty= {};
      this.hybridFunctionNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.hybridFunctionNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }
  
  refreshParameterInputTypes(){
    let inputType: string = this.hybridFunctionNodeConfigFormGroup.get('parameterinputType').value;
    this.configuration.parameterinputType = inputType;
    if (inputType === 'RULE_INPUT'){
      this.configuration.parameterproperty= {};
      this.configuration.parameterbranch= {};
      this.configuration.parameterconstant= {};
      this.hybridFunctionNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      this.hybridFunctionNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
      this.hybridFunctionNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.parameterparam= {};
      this.configuration.parameterbranch= {};
      this.configuration.parameterconstant= {};
      this.hybridFunctionNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
      this.hybridFunctionNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
      this.hybridFunctionNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.parameterparam= {};
      this.configuration.parameterproperty= {};
      this.configuration.parameterconstant= {};
      this.hybridFunctionNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
      this.hybridFunctionNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      this.hybridFunctionNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
    } else if (inputType === 'CONSTANT'){
      this.configuration.parameterparam= {};
      this.configuration.parameterproperty= {};
      this.configuration.parameterbranch= {};
      this.hybridFunctionNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
      this.hybridFunctionNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      this.hybridFunctionNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
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

    let errorInputType: string = this.hybridFunctionNodeConfigFormGroup.get('errorParameterinputType').value;
    let errorBranchparameter = this.hybridFunctionNodeConfigFormGroup.get('errorBranchparameter').value;

    if (errorInputType === 'RULE_INPUT'){
      let selectedErrorParameterParam = this.hybridFunctionNodeConfigFormGroup.get('errorParameterparam').value;
      let errorParameter = {
        'parameterName': errorBranchparameter.name,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterParam.inputName
      };
      this.configuration.errorFunctionParameters.push(errorParameter);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'PROPERTY'){
      let selectedErrorParameterProperty = this.hybridFunctionNodeConfigFormGroup.get('errorParameterproperty').value;
      let errorParameterproperty = {
        'parameterName': errorBranchparameter.name,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterProperty.name
      };
      this.configuration.errorFunctionParameters.push(errorParameterproperty);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'BRANCH_PARAM'){
      let selectedErrorParameterBranch = this.hybridFunctionNodeConfigFormGroup.get('errorParameterbranchparam').value;
      let errorParameterbranchparam = {
        'parameterName': errorBranchparameter.name,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterBranch.name
      };
      this.configuration.errorFunctionParameters.push(errorParameterbranchparam);
      this.updateModel(this.configuration);
    }

    this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);

    this.configuration.errorParameterinputType = '';
    this.configuration.errorParameterproperty= {};
    this.configuration.errorParameterparam= {};
    this.configuration.errorBranchparameter= {};
    this.configuration.errorParameterbranchparam= {};

    this.hybridFunctionNodeConfigFormGroup.get('errorParameterinputType').patchValue([], {emitEvent: false});
    this.hybridFunctionNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
    this.hybridFunctionNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
    this.hybridFunctionNodeConfigFormGroup.get('errorBranchparameter').patchValue([], {emitEvent: false});
    this.hybridFunctionNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});

  }

  deleteRow(index: number): void{
    this.configuration.hybridParameters.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.hybridParameters);
    this.updateModel(this.configuration);
  }
  
  addParameter(): void{
    /*
    let number: number = 0;

    if(this.configuration.hybridParameters){
      number = this.configuration.hybridParameters.length + 1;
    } else {
        this.configuration.hybridParameters = [];
        number = this.configuration.hybridParameters.length + 1;
    }
    */

    let inputType: string = this.hybridFunctionNodeConfigFormGroup.get('parameterinputType').value;
    let functionparameter = this.hybridFunctionNodeConfigFormGroup.get('functionparameter').value;
    
    if (inputType === 'RULE_INPUT'){
      let selectedParameterParam = this.hybridFunctionNodeConfigFormGroup.get('parameterparam').value;
      let parameter = {
        'parameterName': functionparameter.paramName,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterParam.inputName,
        'propertyScope': ''
      };
      this.configuration.hybridParameters.push(parameter);
      this.updateModel(this.configuration);
    } else if (inputType === 'PROPERTY'){
      let selectedParameterProperty = this.hybridFunctionNodeConfigFormGroup.get('parameterproperty').value;
      let parameterproperty = {
        'parameterName': functionparameter.paramName,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterProperty.name,
        'propertyScope': selectedParameterProperty.propertyScope
      };
      this.configuration.hybridParameters.push(parameterproperty);
      this.updateModel(this.configuration);
    } else if (inputType === 'BRANCH_PARAM'){
      let selectedParameterBranch = this.hybridFunctionNodeConfigFormGroup.get('parameterbranch').value;
      let parameterbranch = {
        'parameterName': functionparameter.paramName,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterBranch.name,
        'propertyScope': ''
      };
      this.configuration.hybridParameters.push(parameterbranch);
      this.updateModel(this.configuration);
    } else if (inputType === 'CONSTANT'){
      let selectedParameterConstant = this.hybridFunctionNodeConfigFormGroup.get('parameterconstant').value;
      let parameterconstant = {
        'parameterName': functionparameter.paramName,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterConstant.constantName,
        'propertyScope': selectedParameterConstant.scope
      };
      this.configuration.hybridParameters.push(parameterconstant);
      this.updateModel(this.configuration);
    }

    this.datasource = new MatTableDataSource(this.configuration.hybridParameters);

    this.configuration.parameterinputType = '';
    this.configuration.parameterproperty= {};
    this.configuration.parameterbranch= {};
    this.configuration.parameterparam= {};
    this.configuration.parameterconstant= {};
    this.configuration.functionparameter= {};
  
    this.hybridFunctionNodeConfigFormGroup.get('parameterinputType').patchValue([], {emitEvent: false});
    this.hybridFunctionNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
    this.hybridFunctionNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
    this.hybridFunctionNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
    this.hybridFunctionNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
    this.hybridFunctionNodeConfigFormGroup.get('functionparameter').patchValue([], {emitEvent: false});

  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    if(this.configuration.hybridParameters === null || this.configuration.hybridParameters === undefined){
        this.configuration.hybridParameters = [];
    }
    this.datasource = new MatTableDataSource(this.configuration.hybridParameters);
    if (this.changeSubscription) {
      this.changeSubscription.unsubscribe();
      this.changeSubscription = null;
    }

    if(this.configuration.errorFunctionParameters === null || this.configuration.errorFunctionParameters === undefined){
      this.configuration.errorFunctionParameters = [];
    }
    this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);

    if (this.definedConfigComponent) {
      this.definedConfigComponent.configuration = this.configuration;
      this.changeSubscription = this.definedConfigComponent.configurationChanged.subscribe((configuration) => {
        this.updateModel(configuration);
      });
    } else {

      let functionObj = this.configuration.function;
      if(functionObj && this.allHybridFunctions){
        functionObj = this.allHybridFunctions.find(x => x.name === this.configuration.function.name );
      }

      let assignedProperty = this.configuration.assignedProperty;
      if(this.configuration.assignedtoinputType === 'PROPERTY' && assignedProperty && this.allModelProperties){
        assignedProperty = this.allModelProperties.find(x => x.name === this.configuration.assignedProperty.name );
      }

      let errorBranch = this.configuration.errorBranch;
      if(errorBranch && this.allErrorBranches){
        errorBranch = this.allErrorBranches.find(x => x.name === this.configuration.errorBranch.name );
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

      this.hybridFunctionNodeConfigFormGroup.patchValue({
        inputType: this.configuration.inputType,
        functionparameter: this.configuration.functionparameter,
        //record: this.configuration.record,
        //customObject: customObject,
        parameterinputType: this.configuration.parameterinputType,
        parameterparam: this.configuration.parameterparam,
        parameterproperty: this.configuration.parameterproperty,
        parameterconstant: this.configuration.parameterconstant,
        parameterbranch: this.configuration.parameterbranch,
        function: functionObj,
        assignedProperty: assignedProperty,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
        assignedtoinputType: this.configuration.assignedtoinputType,
        assignedReference: assignedReference,
        errorBranch: errorBranch,
        errorInputType: this.configuration.errorInputType,
        errorBranchparameter: this.configuration.errorBranchparameter,
        errorParameterinputType: this.configuration.errorParameterinputType,
        errorParameterparam: this.configuration.errorParameterparam,
        errorParameterproperty: this.configuration.errorParameterproperty,
        errorParameterbranchparam: this.configuration.errorParameterbranchparam,
        errorIsAsync: this.configuration.errorIsAsync
      });

      this.changeSubscription = this.hybridFunctionNodeConfigFormGroup.get('errorIsAsync').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorIsAsync = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.hybridFunctionNodeConfigFormGroup.get('errorBranch').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorBranch = configuration;

            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.hybridFunctionNodeConfigFormGroup.get('errorParameterparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.hybridFunctionNodeConfigFormGroup.get('errorParameterbranchparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterbranchparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.hybridFunctionNodeConfigFormGroup.get('errorParameterproperty').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterproperty = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.hybridFunctionNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.hybridFunctionNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.hybridFunctionNodeConfigFormGroup.get('function').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.function = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.hybridFunctionNodeConfigFormGroup.get('assignedProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedProperty = configuration;
          this.updateModel(this.configuration);
        }
      );
      /*
      this.changeSubscription = this.hybridFunctionNodeConfigFormGroup.get('record').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.record = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.hybridFunctionNodeConfigFormGroup.get('parameterparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.hybridFunctionNodeConfigFormGroup.get('parameterproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.hybridFunctionNodeConfigFormGroup.get('parameterconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.hybridFunctionNodeConfigFormGroup.get('parameterbranch').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterbranch = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.hybridFunctionNodeConfigFormGroup.get('assignedReference').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedReference = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.hybridFunctionNodeConfigFormGroup.get('assignedtoinputType').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {

          this.configuration.assignedtoinputType = configuration;
          if(this.configuration.assignedtoinputType == 'PROPERTY'){
            this.configuration.assignedReference= {};
            this.hybridFunctionNodeConfigFormGroup.get('assignedReference').patchValue([], {emitEvent: false});
          }else if (this.configuration.assignedtoinputType == 'REFERENCE'){
            this.configuration.assignedProperty= {};
            this.hybridFunctionNodeConfigFormGroup.get('assignedProperty').patchValue([], {emitEvent: false});
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
    if (this.definedConfigComponent || this.hybridFunctionNodeConfigFormGroup.valid) {
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

export interface HybridParameters {
  parameterName: string;
  inputType: string;
  input: string;
  property: string;
  propertyScope: string;
}

export interface ErrorFunctionParameters {
  parameterName: string;
  inputType: string;
  input: string;
  property: string;
  propertyScope: string;
}
