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
  selector: 'virtuan-file-upload-node-config',
  templateUrl: './file-upload-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FileUploadNodeConfigComponent),
    multi: true
  }]
})
export class FileUploadNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  allRoots: any[];

  @Input()
  allSubRules: any[];

  @Input()
  allRuleInputs: any[];

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

  @Input()
  allReferenceProperties: any[];

  @Input()
  apptype: string;

    domainModelProperties: any[];
    viewModelProperties: any[];

  @Input()
  disabled: boolean;

  @Input()
  ruleNodeId: string;

  @Input() branchAvailability: any;

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

  fileUploadNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  errordatasource: MatTableDataSource<ErrorFunctionParameters>;
  displayErroredColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

  selectedVariableProperties: any[];
  selectedVariablePropertiesForParameter: any[];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.fileUploadNodeConfigFormGroup = this.fb.group({
     // inputType: [],
     // param: [],
     // constant: [],
     // property: [],
      errorMsg: "",
      errorAction: "",
      //branchparam: [],
      assignedProperty: [],
      assignedtoinputType: "",
      assignedReference: [],
      errorBranch: [],
      errorInputType: [],
      errorIsAsync: false,
      errorBranchparameter: [],
      errorParameterinputType: [],
      errorParameterparam: [],
      errorParameterproperty: [],
      errorParameterbranchparam: [],
      isReturn: false
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
  
  /*
  refreshInputTypes(){

    let inputType: string = this.fileUploadNodeConfigFormGroup.get('inputType').value;
    this.configuration.inputType = inputType;
    if (inputType === 'CONSTANT'){

      this.configuration.param= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      this.fileUploadNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.fileUploadNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      this.fileUploadNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    } else if (inputType === 'PARAM'){
      this.configuration.constant= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      this.fileUploadNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      this.fileUploadNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.fileUploadNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.branchparam= {};
      this.fileUploadNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      this.fileUploadNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.fileUploadNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.property= {};
      this.fileUploadNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.fileUploadNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.fileUploadNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }
  */

  refreshErrorParameterInputTypes(){
    let errorInputType: string = this.fileUploadNodeConfigFormGroup.get('errorParameterinputType').value;
    this.configuration.errorParameterinputType = errorInputType;
    if (errorInputType === 'RULE_INPUT'){
      this.configuration.errorParameterproperty= {};
      this.configuration.errorParameterbranchparam= {};
      this.fileUploadNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.fileUploadNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'PROPERTY'){
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterbranchparam= {};
      this.fileUploadNodeConfigFormGroup.get('parameterbranchparam').patchValue([], {emitEvent: false});
      this.fileUploadNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'BRANCH_PARAM'){
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterproperty= {};
      this.fileUploadNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.fileUploadNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'ERROR'){
      this.configuration.errorParameterbranchparam= {};
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterproperty= {};
      this.fileUploadNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.fileUploadNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
      this.fileUploadNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.fileUploadNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.fileUploadNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  deleteErrorRow(index: number): void{
    this.configuration.errorFunctionParameters.splice(index, 1);
    this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);
    this.updateModel(this.configuration);
  }

  addErrorParameter(): void{

    let errorInputType: string = this.fileUploadNodeConfigFormGroup.get('errorParameterinputType').value;
    let errorBranchparameter = this.fileUploadNodeConfigFormGroup.get('errorBranchparameter').value;

    if (errorInputType === 'RULE_INPUT'){
      let selectedErrorParameterParam = this.fileUploadNodeConfigFormGroup.get('errorParameterparam').value;
      let errorParameter = {
        'parameterName': errorBranchparameter.paramName,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterParam.inputName
      };
      this.configuration.errorFunctionParameters.push(errorParameter);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'PROPERTY'){
      let selectedErrorParameterProperty = this.fileUploadNodeConfigFormGroup.get('errorParameterproperty').value;
      let errorParameterproperty = {
        'parameterName': errorBranchparameter.paramName,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterProperty.name
      };
      this.configuration.errorFunctionParameters.push(errorParameterproperty);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'BRANCH_PARAM'){
      let selectedErrorParameterBranch = this.fileUploadNodeConfigFormGroup.get('errorParameterbranchparam').value;
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

    this.fileUploadNodeConfigFormGroup.get('errorParameterinputType').patchValue([], {emitEvent: false});
    this.fileUploadNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
    this.fileUploadNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
    this.fileUploadNodeConfigFormGroup.get('errorBranchparameter').patchValue([], {emitEvent: false});
    this.fileUploadNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});

  }


  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
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
      
      /*
      let p = this.configuration.param;
      if(this.configuration.inputType === 'PARAM' && this.inputProperties){
        p = this.inputProperties.find(x => x.inputName === this.configuration.param.inputName );
      }

      let c = this.configuration.constant;
      if(this.configuration.inputType === 'CONSTANT' && this.allConstants){
        c = this.allConstants.find(x => x.constantName === this.configuration.constant.constantName );
      }

      let property = this.configuration.property;
      if(this.configuration.inputType === 'PROPERTY' && this.allModelProperties){
        property = this.allModelProperties.find(x => x.name === this.configuration.property.name );
      }

      let branchparam = this.configuration.branchparam;
      if(this.configuration.inputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams){
        branchparam = this.branchAvailability.branchParams.find(x => x.name === this.configuration.branchparam.name );
      }
      */
      
      let assignedProperty = this.configuration.assignedProperty;
      if(this.configuration.assignedtoinputType === 'PROPERTY' && assignedProperty && this.allModelProperties){
        assignedProperty = this.allModelProperties.find(x => x.name === this.configuration.assignedProperty.name );
      }
      
      let assignedReference = this.configuration.assignedReference;
      if(this.configuration.assignedtoinputType === 'REFERENCE' && assignedReference && this.allReferenceProperties){
        assignedReference = this.allReferenceProperties.find(x => x.name === this.configuration.assignedReference.name );
      }

      let errorBranch = this.configuration.errorBranch;
      if(errorBranch && this.allSubRules){
        errorBranch = this.allSubRules.find(x => x.name === this.configuration.errorBranch.name );
      }

      this.fileUploadNodeConfigFormGroup.patchValue({
      //  inputType: this.configuration.inputType,
      //  param: p,
      //  constant: c,
      //  property: property,
      //  branchparam: branchparam,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
        assignedProperty: assignedProperty,
        assignedtoinputType: this.configuration.assignedtoinputType,
        assignedReference: assignedReference,
        errorBranch: errorBranch,
        errorInputType: this.configuration.errorInputType,
        errorBranchparameter: this.configuration.errorBranchparameter,
        errorParameterinputType: this.configuration.errorParameterinputType,
        errorParameterparam: this.configuration.errorParameterparam,
        errorParameterproperty: this.configuration.errorParameterproperty,
        errorParameterbranchparam: this.configuration.errorParameterbranchparam,
        errorIsAsync: this.configuration.errorIsAsync,
        isReturn: this.configuration.isReturn
      });

      /*
      this.changeSubscription = this.fileUploadNodeConfigFormGroup.get('param').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.param = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.fileUploadNodeConfigFormGroup.get('branchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.branchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.fileUploadNodeConfigFormGroup.get('constant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.constant = configuration;


          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.fileUploadNodeConfigFormGroup.get('property').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.property = configuration;


          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.fileUploadNodeConfigFormGroup.get('isReturn').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.isReturn = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.fileUploadNodeConfigFormGroup.get('errorIsAsync').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorIsAsync = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.fileUploadNodeConfigFormGroup.get('errorBranch').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorBranch = configuration;

            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.fileUploadNodeConfigFormGroup.get('errorParameterparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.fileUploadNodeConfigFormGroup.get('errorParameterbranchparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterbranchparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.fileUploadNodeConfigFormGroup.get('errorParameterproperty').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterproperty = configuration;
            this.updateModel(this.configuration);
          }
      );
      
      this.changeSubscription = this.fileUploadNodeConfigFormGroup.get('assignedProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedProperty = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.fileUploadNodeConfigFormGroup.get('assignedReference').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedReference = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.fileUploadNodeConfigFormGroup.get('assignedtoinputType').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {

          this.configuration.assignedtoinputType = configuration;
          if(this.configuration.assignedtoinputType == 'PROPERTY'){
            this.configuration.assignedReference= {};
            this.fileUploadNodeConfigFormGroup.get('assignedReference').patchValue([], {emitEvent: false});
          }else if (this.configuration.assignedtoinputType == 'REFERENCE'){
            this.configuration.assignedProperty= {};
            this.fileUploadNodeConfigFormGroup.get('assignedProperty').patchValue([], {emitEvent: false});
          }
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.fileUploadNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.fileUploadNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.fileUploadNodeConfigFormGroup.valid) {
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
