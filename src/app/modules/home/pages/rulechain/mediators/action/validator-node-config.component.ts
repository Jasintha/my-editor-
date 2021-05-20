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
  selector: 'virtuan-validator-node-config',
  templateUrl: './validator-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ValidatorNodeConfigComponent),
    multi: true
  }]
})
export class ValidatorNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  inputProperties: any[];

  @Input()
  allConstants: any[];

  @Input()
  inputCustomobjects: any[];

  @Input()
  allModelProperties: any[];

  @Input()
  allRoots: any[];

  @Input()
  allRuleInputs: any[];

  @Input() branchAvailability: any;

  @Input()
  apptype: string;

  nodeDefinitionValue: RuleNodeDefinition;

  datasource: MatTableDataSource<Validator>;

  displayedColumns: string[] = ['inputType', 'property', 'condition', 'value', 'join', 'actions'];

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

  validatorNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  errordatasource: MatTableDataSource<ErrorFunctionParameters>;
  displayErroredColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.validatorNodeConfigFormGroup = this.fb.group({
      validatorinputType: [],
      validatorparam: [],
      validatorproperty: [],
      validatorcondition: [],
      customValue: [],
      join: [],
      // root: [],
      // isAsync: false,
      errorMsg: "",
      errorAction: "",
      validatorbranch: [],
      errorBranch: [],
      errorInputType: [],
      errorIsAsync: false,
      errorBranchparameter: [],
      errorParameterinputType: [],
      errorParameterparam: [],
      errorParameterproperty: [],
      errorParameterbranchparam: [],
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

  refreshErrorParameterInputTypes(){
    let errorInputType: string = this.validatorNodeConfigFormGroup.get('errorParameterinputType').value;
    this.configuration.errorParameterinputType = errorInputType;
    if (errorInputType === 'RULE_INPUT'){
      this.configuration.errorParameterproperty= {};
      this.configuration.errorParameterbranchparam= {};
      this.validatorNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.validatorNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'PROPERTY'){
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterbranchparam= {};
      this.validatorNodeConfigFormGroup.get('parameterbranchparam').patchValue([], {emitEvent: false});
      this.validatorNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'BRANCH_PARAM'){
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterproperty= {};
      this.validatorNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.validatorNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshInputTypes(){
    let inputType: string = this.validatorNodeConfigFormGroup.get('validatorinputType').value;
    this.configuration.validatorinputType = inputType;
    if (inputType === 'RULE_INPUT'){
      this.configuration.validatorproperty= {};
      this.configuration.validatorbranch= {};
      this.validatorNodeConfigFormGroup.get('validatorproperty').patchValue([], {emitEvent: false});
      this.validatorNodeConfigFormGroup.get('validatorbranch').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.validatorparam= {};
      this.configuration.validatorbranch= {};
      this.validatorNodeConfigFormGroup.get('validatorparam').patchValue([], {emitEvent: false});
      this.validatorNodeConfigFormGroup.get('validatorbranch').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.validatorparam= {};
      this.configuration.validatorproperty= {};
      this.validatorNodeConfigFormGroup.get('validatorparam').patchValue([], {emitEvent: false});
      this.validatorNodeConfigFormGroup.get('validatorproperty').patchValue([], {emitEvent: false});
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

    let errorInputType: string = this.validatorNodeConfigFormGroup.get('errorParameterinputType').value;
    let errorBranchparameter = this.validatorNodeConfigFormGroup.get('errorBranchparameter').value;

    if (errorInputType === 'RULE_INPUT'){
      let selectedErrorParameterParam = this.validatorNodeConfigFormGroup.get('errorParameterparam').value;
      let errorParameter = {
        'parameterName': errorBranchparameter.name,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterParam.inputName
      };
      this.configuration.errorFunctionParameters.push(errorParameter);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'PROPERTY'){
      let selectedErrorParameterProperty = this.validatorNodeConfigFormGroup.get('errorParameterproperty').value;
      let errorParameterproperty = {
        'parameterName': errorBranchparameter.name,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterProperty.name
      };
      this.configuration.errorFunctionParameters.push(errorParameterproperty);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'BRANCH_PARAM'){
      let selectedErrorParameterBranch = this.validatorNodeConfigFormGroup.get('errorParameterbranchparam').value;
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

    this.validatorNodeConfigFormGroup.get('errorParameterinputType').patchValue([], {emitEvent: false});
    this.validatorNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
    this.validatorNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
    this.validatorNodeConfigFormGroup.get('errorBranchparameter').patchValue([], {emitEvent: false});
    this.validatorNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});

  }

  addValidator(): void{

    let inputType: string = this.validatorNodeConfigFormGroup.get('validatorinputType').value;

    let join: string = this.validatorNodeConfigFormGroup.get('join').value;
    if(join){
    } else {
        join = '';
    }

    let constant = this.validatorNodeConfigFormGroup.get('customValue').value;

    let customvalue: string = '';


    if(constant){
        customvalue = constant.constantName;
    } else {
        customvalue = '';
    }

    if (inputType === 'RULE_INPUT'){
      let selectedParam = this.validatorNodeConfigFormGroup.get('validatorparam').value;
      let validatorparam = {
        'inputType': inputType,
        'condition': this.validatorNodeConfigFormGroup.get('validatorcondition').value,
        'join': join,
        'value': customvalue,
        'property': selectedParam.inputName
      };
      this.configuration.validators.push(validatorparam);
      this.updateModel(this.configuration);
    } else if (inputType === 'PROPERTY'){
      let selectedProperty = this.validatorNodeConfigFormGroup.get('validatorproperty').value;
      let validatorproperty = {
        'inputType': inputType,
        'condition': this.validatorNodeConfigFormGroup.get('validatorcondition').value,
        'join': join,
        'value': customvalue,
        'property': selectedProperty.name
      };

      this.configuration.validators.push(validatorproperty);
      this.updateModel(this.configuration);
    } else if (inputType === 'BRANCH_PARAM'){
      let selectedBranch = this.validatorNodeConfigFormGroup.get('validatorbranch').value;
      let validatorbranch = {
        'inputType': inputType,
        'condition': this.validatorNodeConfigFormGroup.get('validatorcondition').value,
        'join': join,
        'value': customvalue,
        'property': selectedBranch.name
      };

      this.configuration.validators.push(validatorbranch);
      this.updateModel(this.configuration);
    }

    this.datasource = new MatTableDataSource(this.configuration.validators);

    this.configuration.validatorinputType = '';
    this.configuration.validatorproperty= {};
    this.configuration.validatorbranch= {};
    this.configuration.validatorparam= {};
    this.configuration.customValue= {};
    this.configuration.validatorcondition= '';
    this.configuration.join= '';

    this.validatorNodeConfigFormGroup.get('validatorinputType').patchValue([], {emitEvent: false});
    this.validatorNodeConfigFormGroup.get('validatorparam').patchValue([], {emitEvent: false});
    this.validatorNodeConfigFormGroup.get('validatorproperty').patchValue([], {emitEvent: false});
    this.validatorNodeConfigFormGroup.get('validatorbranch').patchValue([], {emitEvent: false});
    this.validatorNodeConfigFormGroup.get('join').patchValue("", {emitEvent: false});
    this.validatorNodeConfigFormGroup.get('customValue').patchValue({}, {emitEvent: false});
    this.validatorNodeConfigFormGroup.get('validatorcondition').patchValue("", {emitEvent: false});

  }

  deleteRow(index: number): void{
    this.configuration.validators.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.validators);
    this.updateModel(this.configuration);
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.validatorNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.validatorNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);


    if(this.configuration.validators){
    } else {
        this.configuration.validators = [];
    }

    this.datasource = new MatTableDataSource(this.configuration.validators);

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
      let root = this.configuration.root;
      if(root && this.allRoots){
        root = this.allRoots.find(x => x === this.configuration.root );
      }
      */

      let errorBranch = this.configuration.errorBranch;
      if(errorBranch && this.allRoots){
        errorBranch = this.allRoots.find(x => x.name === this.configuration.errorBranch.name );
      }

      this.validatorNodeConfigFormGroup.patchValue({
       // root: root,
       // isAsync: this.configuration.isAsync,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
        errorBranch: errorBranch,
        errorInputType: this.configuration.errorInputType,
        errorBranchparameter: this.configuration.errorBranchparameter,
        errorParameterinputType: this.configuration.errorParameterinputType,
        errorParameterparam: this.configuration.errorParameterparam,
        errorParameterproperty: this.configuration.errorParameterproperty,
        errorParameterbranchparam: this.configuration.errorParameterbranchparam,
        errorIsAsync: this.configuration.errorIsAsync
      });

      /*
      this.changeSubscription = this.validatorNodeConfigFormGroup.get('isAsync').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.isAsync = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.validatorNodeConfigFormGroup.get('errorIsAsync').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorIsAsync = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.validatorNodeConfigFormGroup.get('errorBranch').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorBranch = configuration;

            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.validatorNodeConfigFormGroup.get('errorParameterparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.validatorNodeConfigFormGroup.get('errorParameterbranchparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterbranchparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.validatorNodeConfigFormGroup.get('errorParameterproperty').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterproperty = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.validatorNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.validatorNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

    /*
      this.changeSubscription = this.validatorNodeConfigFormGroup.get('root').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.root = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.validatorNodeConfigFormGroup.get('validatorparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.validatorparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.validatorNodeConfigFormGroup.get('validatorproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.validatorproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.validatorNodeConfigFormGroup.get('validatorcondition').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.validatorcondition = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.validatorNodeConfigFormGroup.get('customValue').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.customValue = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.validatorNodeConfigFormGroup.get('join').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.join = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.validatorNodeConfigFormGroup.get('validatorbranch').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.validatorbranch = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {

    if (this.definedConfigComponent || this.validatorNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}


export interface Validator {
  inputType: string;
  property: string;
  condition: string;
  join: string;
  value: string;
}

export interface ErrorFunctionParameters {
  parameterName: string;
  inputType: string;
  input: string;
  property: string;
}